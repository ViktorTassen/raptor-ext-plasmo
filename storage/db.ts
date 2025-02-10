import Dexie, { type Table } from 'dexie'

export interface Vehicle {
  id: string
  listName: string
  data: any
  lastUpdated: Date
  enrichedData?: any
}

export class RaptorDatabase extends Dexie {
  vehicles!: Table<Vehicle>

  constructor() {
    super('RaptorDB')
    this.version(1).stores({
      vehicles: '++id, listName, lastUpdated'
    })
  }

  async addVehicles(listName: string, vehicles: any[]) {
    const batch = vehicles.map(vehicle => ({
      id: vehicle.id,
      listName,
      data: vehicle,
      lastUpdated: new Date()
    }))

    // Use bulkPut to efficiently update/insert multiple records
    await this.vehicles.bulkPut(batch)
  }

  async updateVehicleEnrichedData(vehicleId: string, enrichedData: any) {
    await this.vehicles.where('id').equals(vehicleId).modify(vehicle => {
      vehicle.enrichedData = enrichedData
      vehicle.lastUpdated = new Date()
    })
  }

  async getVehiclesByList(listName: string): Promise<Vehicle[]> {
    return await this.vehicles.where('listName').equals(listName).toArray()
  }

  async getVehiclesForEnrichment(olderThan: Date): Promise<Vehicle[]> {
    return await this.vehicles
      .where('lastUpdated')
      .below(olderThan)
      .limit(10)
      .toArray()
  }
}