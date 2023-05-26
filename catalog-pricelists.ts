import { Configuration } from "@kibocommerce/rest-sdk";
import {PriceListsApi, PriceListEntriesApi, PriceList, PriceListEntry} from "@kibocommerce/rest-sdk/clients/CatalogAdministration"

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

async function main(priceListCode:string, priceListEntries:Array<string>){
	const priceListClient = new PriceListsApi(configuration)
	const priceListEntriesClient = new PriceListEntriesApi(configuration)

	const priceListBody:PriceList = {
		priceListCode: priceListCode,
		name: priceListCode,
		enabled:true,
		defaultForSites: [60296],
		indexedSites: [60296]
	}

	try{
		await priceListClient.addPriceList({priceList: priceListBody})

		const priceListEntryBody:Array<PriceListEntry> = priceListEntries.map(productCode => {
			return {
				productCode: productCode,
				priceListCode: priceListCode,
				currencyCode: 'USD',
				startDate: new Date(),
				priceEntries: [
					{
						listPrice: 123.00,
						listPriceMode: "Overridden",
						minQty: 1,
						salePrice:100.00,
						salePriceMode: "Overridden"
					}
				]
			}
		})

		const bulkAddPriceListEntries = await priceListEntriesClient.bulkAddPriceListEntries({priceListEntry: priceListEntryBody})
		console.log('Added price list entries')
	} catch(e){
		console.log(e)
	}

	
}

main("dev-training", ["Hats_001", "Hats_002"])