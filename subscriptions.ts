import { Configuration } from "@kibocommerce/rest-sdk";
import { SubscriptionApi } from "@kibocommerce/rest-sdk/clients/Subscription"

const configuration = new Configuration({
	tenantId: '',
	siteId: '',
	catalog: '',
	masterCatalog: '',
	sharedSecret: '',
	clientId: '',
	pciHost: 'pmts.mozu.com',
	authHost: 'home.mozu.com',
	apiEnv: 'sandbox',
})

const subscriptionBody = {
	"items": [
	   {
		"fulfillmentMethod": "Ship",
		"product": {
		  "productCode": "subs-prod",
		  "isTaxable": false,
		  "price": {
			"price": 12.00
		  }
		},
		"quantity": 1
	  }
	],
	"payment": {
	  "availableActions": [],
	  "paymentType": "CreditCard",
	  "paymentWorkflow": "Mozu",
	  "billingInfo": {
		"paymentType": "CreditCard",
		"billingContact": {
		  "email": "bobsmith@kibodev.com",
		  "firstName": "Bob",
		  "middleNameOrInitial": "",
		  "lastNameOrSurname": "Smith",
		  "phoneNumbers": {
			"home": "1231231234",
			"mobile": "",
			"work": ""
		  },
		  "address": {
			"address1": "1234 Fake",
			"address2": "",
			"address3": "",
			"address4": "",
			"cityOrTown": "Dallas",
			"stateOrProvince": "TX",
			"postalOrZipCode": "75201",
			"countryCode": "US",
			"addressType": "Residential",
			"isValidated": false
		  }
		},
		"isSameBillingShippingAddress": false,
		"card": {
		  "paymentServiceCardId": "41ef88113dfb49c7af1ab78a19c22a47",
		  "isUsedRecurring": false,
		  "nameOnCard": "Bob Smith",
		  "isCardInfoSaved": false,
		  "isTokenized": false,
		  "paymentOrCardType": "VISA",
		  "cardNumberPartOrMask": "************1111",
		  "expireMonth": 1,
		  "expireYear": 2025
		},
		"auditInfo": {},
		"isRecurring": false
	  },
	  "status": "New",
	  "subPayments": [],
	  "interactions": [],
	  "isRecurring": false,
	  "amountCollected": 0,
	  "amountCredited": 0,
	  "amountRequested": 30,
	  "changeMessages": [],
	  "auditInfo": {}
	},
	"fulfillmentInfo": {
	  "fulfillmentContact": {
		  "email": "bobsmith@kibodev.com",
		  "firstName": "Bob",
		  "middleNameOrInitial": "",
		  "lastNameOrSurname": "Smith",
		  "phoneNumbers": {
			"home": "1231231234",
			"mobile": "",
			"work": ""
		  },
		  "address": {
			"address1": "1234 Fake",
			"address2": "",
			"address3": "",
			"address4": "",
			"cityOrTown": "Dallas",
			"stateOrProvince": "TX",
			"postalOrZipCode": "75201",
			"countryCode": "US",
			"addressType": "Residential",
			"isValidated": false
		  }
	  },
	  "shippingMethodCode": "flat-rate",
	  "shippingMethodName": "Flat Rate"
	},
	"priceListCode": "subs-price",
	"userId": "51ed7638f2db48a38a8ab93408c2bcbb",
	"customerAccountId": 1003,
	"email": "bobsmit@kibodev.com",
	"isTaxExempt": false,
	"currencyCode": "USD",
	"frequency": {
	  "unit": "Day",
	  "value": 15
	},
	"nextOrderDate": new Date("2023-05-10T16:26:42.270Z"),
	"status": "Active",
	"isImport": false,
	"reactivationDate": new Date("2024-05-10T16:26:42.270Z")
  }

const addItemBody =  {
	"fulfillmentMethod": "Ship",
	"product": {
	  "productCode": "subs-prod",
	  "isTaxable": false,
	  "price": {
		"price": 12.00
	  }
	},
	"quantity": 1
  }

const subAction = {
    "actionName": "Activate",
    "reason": {
            "reasonCode": "ts_Activate",
            "name": "ts-sdk Activate",
            "needsMoreInfo": false
        }
}

async function main(){
	const subscriptionsClient = new SubscriptionApi(configuration)

	try{
		const createdSubscription = await subscriptionsClient.createSubscription({subscription: subscriptionBody})

		if(createdSubscription.id){
			const subId = createdSubscription.id
			const addedItemToSub = await subscriptionsClient.addSubscriptionItem({subscriptionId:subId, subscriptionItem: addItemBody})

			console.log(`Added Item to Sub ${subId}`)

			const activatedSub = await subscriptionsClient.performSubscriptionAction({subscriptionId: subId, subscriptionAction: subAction})

			console.log(`Activated Subscription!`)	

		}
	}catch(e){
		console.log(e)
	}
}
main()