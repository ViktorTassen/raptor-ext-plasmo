export function getVehicleTypeDisplay(type: string): string {
    switch (type) {
      case "CAR":
        return "Cars"
      case "SUV":
        return "SUVs"
      case "PASSENGER_MINIVAN":
      case "MINIVAN":
        return "Minivans"
      case "TRUCK":
        return "Trucks"
      case "PASSENGER_VAN":
      case "VAN":
        return "Vans"
      case "CARGO_VAN":
      case "CARGO_MINIVAN":
        return "Cargo Vans"
      case "BOX_TRUCK":
        return "Box Trucks"
      default:
        return type
    }
  }