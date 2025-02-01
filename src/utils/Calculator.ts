export default function calculator(){
  const urlParams = new URLSearchParams(window.location.search);
  const initial = {
    newInvestments: urlParams.get('newInvestments') ?? 1000000,
    numberOfInvestments: urlParams.get('numberOfInvestments') ?? 1,
  }
  
  const prefferedReturn = (totalInvested: number, prefReturn = 0.06) =>
  totalInvested * prefReturn
  
  
  const returnPercent = 0.056; // preferred return
  const targetEM = 1.8; // target EM
  const holdTime = 3;
  
  const year0 = (newInvestments: number) => ({
    number: 0,
    totalInvested: 0,
    prefferedReturn: 0,
    profitsOnSale: 0,
    endingInvestedBalance: -newInvestments,
    cashFlow: 0
  })
  
  const nextYear = (years: any, newInvestments: any) => {
    const previousYear = years[years.length - 1]
    const holdenYear = years[years.length - (holdTime)] || year0(newInvestments)
    const totalInvested = previousYear.endingInvestedBalance
    const prefferedReturn = totalInvested * returnPercent
    
    const profitsOnSale = years.length >= holdTime ? (holdenYear.profitsOnSale - newInvestments) * targetEM + newInvestments * (1 + returnPercent * holdTime) : 0
    
    const result = {
      number: years.length,
      totalInvested,
      prefferedReturn,
      profitsOnSale,
      endingInvestedBalance: totalInvested - newInvestments + profitsOnSale,
      cashFlow: prefferedReturn / 12
    }
    
    return result
  }
  
  
  
  return {
    newInvestments: initial.newInvestments, 
    numberOfInvestments: initial.numberOfInvestments,
    total: 0,
    priceToNumber(value: any){
      return parseInt(value.split(',').join(''))
    },
    numberToPrice(value: any){
      let [dollars, cents] = parseFloat(value).toFixed(2).split('.')
      dollars = dollars.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      if(!dollars) dollars = '0'
      if(!cents) cents = '0'
      return dollars + '.' + cents
    },
    years(){
      const years = []
      const newInvestments = -this.priceToNumber(this.newInvestments) * this.priceToNumber(this.numberOfInvestments)
      years.push(year0(newInvestments))
      for (let index = 0; index < 30; index++) {
        years.push(nextYear(years, newInvestments))      
      }
      this.total = years[30].totalInvested
      return years
    },
    getBiggerValue(){
      const years = this.years()
      return parseFloat(years[years.length - 1].totalInvested)
    },
    getSmalledValue(){
      const years = this.years()
      return years[0].totalInvested
    },
    toSpecialNotation(value: any){
      if(value > 1000000){
        return Math.floor(parseInt(value) / 1000000) + 'M'
      }
      else if(value > 1000){
        return Math.floor(parseInt(value) / 1000) + 'K'
      }
      else {
        return value
      }
    },
    selectedYears(){
      const years = this.years()
      const result = {
        1: years[1],
        2: years[2],
        3: years[3],
        4: years[4],
        5: years[5],
        10: years[10],
        15: years[15],
        20: years[20],
        25: years[25],
        30: years[30],
      }
      return result
    }
  } 
}
