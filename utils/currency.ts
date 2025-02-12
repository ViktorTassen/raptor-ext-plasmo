const currencySymbols: { [key: string]: string } = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    CNY: "¥",
    KRW: "₩",
    INR: "₹",
    RUB: "₽",
    TRY: "₺",
    BRL: "R$",
    CAD: "C$",
    AUD: "A$",
    NZD: "NZ$",
    CHF: "CHF",
    HKD: "HK$",
    SGD: "S$",
    SEK: "kr",
    NOK: "kr",
    DKK: "kr",
    PLN: "zł",
    THB: "฿",
    MXN: "Mex$",
    ZAR: "R"
  }
  
  export function getCurrencySymbol(code: string): string {
    return currencySymbols[code] || code
  }