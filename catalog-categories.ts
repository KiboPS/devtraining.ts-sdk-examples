import { Configuration } from "@kibocommerce/rest-sdk";
import { CategoriesApi, Category } from "@kibocommerce/rest-sdk/clients/CatalogAdministration"
import { truncate } from "fs";

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

async function createCategoryAndAddProducts(categoryName:string, products:Array<string>){
	const categoryClient = new CategoriesApi(configuration)

	const categoryBody:Category = {
		categoryType: 'Static',
		categoryCode: categoryName.replace(/\s/g, '-'),
		content:{
			name: categoryName,
			description: 'Dev Static Category'
		},
		isActive: true,
		isDisplayed: true,
		catalogId: 1
	}

	try{
		const newCategory = await categoryClient.addCategory({category:categoryBody})

		console.log(`Created new category`)

		if(newCategory.id){
			const addedProducts = await categoryClient.addProductsToCategory({categoryId: newCategory.id, requestBody: products})
			console.log('Added new products')
		}
	}catch(e){
		console.log(e)
	}
}

async function createDynamicCategory(categoryName:string, expression:Category['dynamicExpression']){
	const categoryClient = new CategoriesApi(configuration)

	const categoryBody:Category = {
		categoryType: 'DynamicPreComputed',
		categoryCode: categoryName.replace(/\s/g, '-'),
		content:{
			name: categoryName,
			description: 'Dynamic Dev Category',
		},
		dynamicExpression: expression,
		isActive: true,
		isDisplayed: true,
		catalogId: 1
	}

	try{
		const newCategory = await categoryClient.addCategory({category: categoryBody})

		console.log('Created new dynamic category')
	}catch(e){
		console.log(e)
	}

}

const expression:Category['dynamicExpression'] = {
	text: 'daysavailableincatalog lt 30 and properties.Tenant~fabric-type eq "Cotton-/-Cotton-Blend"',
	tree:{
		"type": "container",
		"logicalOperator": "and",
		"nodes": [
			{
				"type": "predicate",
				"left": "daysavailableincatalog",
				"right": 30,
				"operator": "lt"
			},
			{
				"type": "predicate",
				"left": "properties.Tenant~fabric-type",
				"right": "Cotton-/-Cotton-Blend",
				"operator": "eq"
			}
		]
	}
}

createDynamicCategory('Dynamic Category', expression)

//createCategoryAndAddProducts('Static Category', ["Hats_001", "Hats_002"])