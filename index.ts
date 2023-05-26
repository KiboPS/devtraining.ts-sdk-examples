import { Configuration } from "@kibocommerce/rest-sdk";
import { ProductsApi} from '@kibocommerce/rest-sdk/clients/CatalogAdministration'
import {ProductSearchApi} from '@kibocommerce/rest-sdk/clients/CatalogStorefront'

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

async function main (){
	const productsClient = new ProductsApi(configuration)
	const ProductSearchApiClient = new ProductSearchApi(configuration)

	try{
		const product = await productsClient.getProduct({productCode: "Hammock_001"})
		//console.log(product)
		if(product && product.content){
			product.content.productFullDescription = 'Developer Training Update'
		}

		const updatedProduct = await productsClient.updateProduct({productCode: "Hammock_001", product: product})

		console.log(updatedProduct.content)

	} catch(e){
		console.error(e)
	}
}
main()


