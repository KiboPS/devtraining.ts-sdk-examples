import { Configuration } from "@kibocommerce/rest-sdk";
import { ProductAttributesApi, ProductTypesApi, ProductOptionsApi, ProductVariationsApi } from "@kibocommerce/rest-sdk/clients/CatalogAdministration"

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

async function main(colorName:string, attributeFQN:string, productTypeId:number, productCode:string){
	const productAttributesClient = new ProductAttributesApi(configuration)
	const productTypesClient = new ProductTypesApi(configuration)
	const productOptionsClient = new ProductOptionsApi(configuration)
	const productVariationClient = new ProductVariationsApi(configuration)

	const vocabularyValue = {
		value: colorName.replace(/\s/g, '-'),
		vocabularyValueDetail: {
			value:colorName.replace(/\s/g, '-'),
			content:{
				localeCode: 'en-US',
				stringValue: colorName
			} 
		}
	}

	try{
		const updatedValue = await productAttributesClient.addAttributeVocabularyValue({attributeFQN, attributeVocabularyValue:vocabularyValue})
		console.log(`Added attribute value ${colorName}`)

		const productTypeOption = await productTypesClient.getOption({attributeFQN, productTypeId})

		productTypeOption.vocabularyValues?.push(updatedValue)

		const updatedProductType = await productTypesClient.updateOption({attributeFQN, productTypeId, attributeInProductType:productTypeOption})
		console.log(`Updated product type with new color options ${colorName}`)

		const productOptions = await productOptionsClient.getOption({attributeFQN, productCode})

		productOptions.values?.push(updatedValue)

		const addedOptionToProduct = await productOptionsClient.updateOption({productCode, attributeFQN, productOption:productOptions})
		console.log(`Added ${colorName} to product option`)

		const productVariations = await productVariationClient.getProductVariations({productCode})
		productVariations.items = productVariations.items?.map((v,i) => {
			if(!v.isActive){
				const colorMatchValue = colorName.replace(/\s/g, '-')
				const match = v.options?.find(o => o.value == colorMatchValue)

				if(match){
					v.isActive = true
					v.variationExists = true
					v.variationProductCode = `${colorMatchValue}_dev_${i}`
				}
			}
			return v
		})
		
	}catch(e){
		console.log(e)
	}

}

main("Kibo Yellow", "Tenant~brand-colors", 6, "HikeJack_001")