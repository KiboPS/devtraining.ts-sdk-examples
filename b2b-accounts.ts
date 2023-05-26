import "dotenv/config"
import { Configuration } from "@kibocommerce/rest-sdk"
import { B2BAccount, B2BAccountApi, B2BUserAndAuthInfo} from "@kibocommerce/rest-sdk/clients/Customer"
import { AdminUserApi, User } from "@kibocommerce/rest-sdk/clients/AdminUser"

async function main(){
	const configuration = Configuration.fromEnv()
	const b2bClient = new B2BAccountApi(configuration)
	const adminUserClient = new AdminUserApi(configuration)

	const b2bAccountBody:B2BAccount = {
		companyOrOrganization: "Hammock Buyer 1",
		users:[
			{
				firstName: "Bob",
				lastName: "Smith",
				emailAddress: "bob@kibo.com",
				userName: "bob@kibo.com",
				localeCode: "en-US"
			}
		]
	}

	try{
		const newAccount = await b2bClient.addAccount({b2BAccount: b2bAccountBody})
		console.log('Created new B2B account')

		if(newAccount.id){
			const newAdminUserBody: User = {
				firstName: "Clara",
				lastName: "Kibo",
				isActive: true,
				emailAddress: "claraKibo@kibo.com",
				userName: "claraKibo@kibo.com",
				password: 'temppassword123',
				localeCode: 'en-US'
			}

			const newAdminAccountForSalesRep = await adminUserClient.createUser({user: newAdminUserBody})
			console.log('Added new account for sales rep')

			if(newAdminAccountForSalesRep.id){

				await adminUserClient.addUserRole({userId: newAdminAccountForSalesRep.id, roleId: 5518})
				console.log('Added sales rep role to Admin account')

				await b2bClient.addSalesRepToB2BAccount({accountId: newAccount.id, userId: newAdminAccountForSalesRep.id})
				console.log('Added sales rep to B2B Account')

				await b2bClient.updateB2BAccountStatus({accountId: newAccount.id, actionName: 'approve'})
				console.log('Approved B2B account')

				const newUserBody:B2BUserAndAuthInfo = {
					b2BUser:{
						emailAddress: "hammocksales@hammock.com",
						userName: "hammocksales@hammock.com",
						firstName: "Hammock",
						lastName: "Dealer",
						isActive: false,
						localeCode: 'en-US'
					}
				}

				const newUser = await b2bClient.addUser({accountId: newAccount.id, b2BUserAndAuthInfo: newUserBody})
				console.log('Added user to account')

				if(newUser.userId){
					await b2bClient.addUserRoleAsync({userId: newUser.userId, accountId: newAccount.id, roleId: 2})
					console.log('Updated user role')
				}
			}
		}

	}catch(e){
		console.log(e)
	}
}
main()