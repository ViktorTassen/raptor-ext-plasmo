import Dexie, { type Table } from "dexie"
import type { Vehicle } from "~types"

// Create a unique database name that includes the extension ID
const DB_NAME = `raptor_ext_${chrome.runtime.id}`

export class RaptorDB extends Dexie {
  vehicles!: Table<Vehicle>
  searchParams!: Table<{
    id: number
    startDate: string
    startTime: string
    endDate: string
    endTime: string
  }>

  constructor() {
    super(DB_NAME)
    this.version(1).stores({
      vehicles: "id, make, model, year, hostId, isEnriched",
      searchParams: "++id"
    })

    // Add hooks for debugging
    this.on('ready', () => console.log('[Raptor] Database ready'))
    this.on('versionchange', () => console.log('[Raptor] Database version changed'))
    this.on('blocked', () => console.log('[Raptor] Database blocked'))
  }
}

// Only export the class, don't create instance here
export default RaptorDB