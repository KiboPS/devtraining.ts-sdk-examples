import "dotenv/config"
import { Configuration } from "@kibocommerce/rest-sdk";
import { ShipmentApi } from "@kibocommerce/rest-sdk/clients/Fulfillment"

async function main(shipmentNumber:number){
	const configuration = Configuration.fromEnv()
	const shipmentClient = new ShipmentApi(configuration)

	const shipment = await shipmentClient.getShipmentUsingGET({shipmentNumber:shipmentNumber})

	const taskBody = {
		
		taskBody: {
			"shipmentAccepted": {"shipmentAccepted":true}
		}
		
		
	}

	const acceptShipment = await shipmentClient.executeUsingPUT({shipmentNumber: shipmentNumber, taskName:'Accept Shipment', taskComplete: taskBody})

	console.log(JSON.stringify(shipment.workflowState, null, 2))
}
main(15)