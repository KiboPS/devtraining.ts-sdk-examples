import { Configuration } from "@kibocommerce/rest-sdk";
import { CustomerAccountApi, StorefrontAuthTicketApi, CustomerAccount } from "@kibocommerce/rest-sdk/clients/Customer";
import { CartApi, OrderApi, FulfillmentInfo, BillingInfo } from "@kibocommerce/rest-sdk/clients/Commerce"

const SITE_ID = ''
const TENANT_ID = ''

const configuration = new Configuration({
	tenantId: TENANT_ID,
	siteId: SITE_ID,
	catalog: '',
	masterCatalog: '',
	sharedSecret: '',
	clientId: '',
	pciHost: 'pmts.mozu.com',
	authHost: 'home.mozu.com',
	apiEnv: 'sandbox',
})

async function main(){
	const StorefrontAuthClient = new StorefrontAuthTicketApi(configuration)
	const CartClient = new CartApi(configuration)
	const OrderClient = new OrderApi(configuration)
	const CustomerAccountClient = new CustomerAccountApi(configuration)

	try{
		const tokenData = await StorefrontAuthClient.createAnonymousShopperAuthTicket()
		//const tokenData = await StorefrontAuthClient.createUserAuthTicket({customerUserAuthInfo:{username: 'example@kibo.com', password: '******'}})
		const anonToken = tokenData?.jwtAccessToken

		const headers:any = [
			['Authorization', `Bearer ${anonToken}`],
			['Content-Type', 'application/json'],
			['x-vol-site', SITE_ID],
			['x-vol-tenant', TENANT_ID]
		]
		//If anonymous user token, cart will not be assigned an id until an item is added

		const addedItemToCart = await CartClient.addItemToCart({cartItem:{localeCode:'en-US',product:{productCode: "Hammock_004"}, quantity:1}}, {headers})
		const cartItemId = addedItemToCart.id
		//Get Cart id, if anon cart
		const currentCart = await CartClient.getOrCreateCart({headers})

		const cartId = currentCart.id

		if(cartId && cartItemId){
			await CartClient.applyCoupon({cartId, couponCode: 'dev-coupon'}, {headers})
			//Because we are using the same token, this will apply to current cart associated with token
			await CartClient.updateCartItemQuantity({cartItemId, quantity:2}, {headers})

			const createOrder = await OrderClient.createOrder({cartId}, {headers})
			const orderId = createOrder.id

			if(orderId){
				console.log({orderId})
				const fulfillmentInfo: FulfillmentInfo  = {
					fulfillmentContact:{
						firstName: "Bob",
						lastNameOrSurname: "Smith",
						email: "bobsmith@exapmle.com",
						phoneNumbers:{
							mobile: "1231231234"
						},
						address:{
							address1: "1234 Fake",
							cityOrTown: "Dallas",
							stateOrProvince: "TX",
							countryCode: "US",
							postalOrZipCode: "75201"
						}
					}
				}

				await OrderClient.setFulFillmentInfo({orderId, fulfillmentInfo}, {headers})
				const availableShippingMethods = await OrderClient.getAvailableShipmentMethods({orderId}, {headers})
				console.log({availableShippingMethods})

				//Customer selects shipping rate
				fulfillmentInfo.shippingMethodCode = 'flat-rate'
				fulfillmentInfo.shippingMethodName = 'Flat Rate'

				await OrderClient.setFulFillmentInfo({orderId, fulfillmentInfo}, {headers})	

				const billingInfo: BillingInfo = {
					paymentType: "CreditCard",
					paymentWorkflow: "Mozu",
					billingContact:{
						firstName: "Bob",
						lastNameOrSurname: "Smith",
						email: "bobsmith@exapmle.com",
						phoneNumbers:{
							mobile: "1231231234"
						},
						address:{
							address1: "1234 Fake",
							cityOrTown: "Dallas",
							stateOrProvince: "TX",
							countryCode: "US",
							postalOrZipCode: "75201"
						}
					},
					card:{
						paymentOrCardType: 'VISA',
						//create valid payment service card id
						paymentServiceCardId: '123123123123123123123',
						cardNumberPartOrMask: '************1111',
					}
					
					
				}

				await OrderClient.setBillingInfo({orderId, billingInfo}, {headers})

				//Not necessary if using a user auth token, the response for that token will include account id
				const customerAccount:CustomerAccount = {
					"emailAddress": "sameasbillinginfo@kibo.com"
				}

				const createdCustomerAccount = await CustomerAccountClient.addAccount({customerAccount}, {headers})
				const customerAccountId = createdCustomerAccount.id

				if(customerAccountId){

					const currentOrder = await OrderClient.getOrder({orderId}, {headers})

					currentOrder.customerAccountId = customerAccountId
					await OrderClient.updateOrder({orderId, order:currentOrder}, {headers})


					const availableActions = await OrderClient.getAvailableActions({orderId}, {headers})
					console.log({availableActions})
	
					if(availableActions.includes('SubmitOrder')){
						await OrderClient.performOrderAction({orderId, orderAction:{actionName: 'SubmitOrder'}}, {headers})
						console.log('Submitted Order!')
					}
				}
			}
		}
	} catch(e){
		console.log(e)
	}	
}

main()