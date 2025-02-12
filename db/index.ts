import Dexie, { type Table } from "dexie"
import type { Vehicle } from "~types"

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
    super("RaptorDB")
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

export const db = new RaptorDB()

// Don't auto-open the database, let the background script handle it
console.log('[Raptor] Database instance created')