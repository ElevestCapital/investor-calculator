export default function calculator() {
    const urlParams = new URLSearchParams(window.location.search);
    const initial = {
        newInvestments: urlParams.get('newInvestments') ?? '',
        numberOfInvestments: urlParams.get('numberOfInvestments') ?? '',
        investmentType: urlParams.get('investmentType') ?? 'oneTimePayment',
    };
    const prefferedReturn = (totalInvested: number, prefReturn = 0.06) =>
        totalInvested * prefReturn;
    const returnPercent = 0.046; // preferred return
    const targetEM = 1.8; // target EM
    const holdTime = 3;
    const year0 = (newInvestments: number) => ({
        number: 0,
        totalInvested: 0,
        prefferedReturn: 0,
        profitsOnSale: 0,
        endingInvestedBalance: -newInvestments,
        cashFlow: 0,
    });
    const nextYear = (years: any, newInvestments: any) => {
        const previousYear = years[years.length - 1];
        const holdenYear =
            years[years.length - holdTime] || year0(newInvestments);
        const totalInvested = previousYear.endingInvestedBalance;
        const prefferedReturn = totalInvested * returnPercent;
        let profitsOnSale = 0;
        if (initial.investmentType === 'oneTimePayment') {
            if (years.length % 3 === 0) {
                profitsOnSale =
                    years.length === 3
                        ? (holdenYear.profitsOnSale - newInvestments) *
                              targetEM +
                          newInvestments * (1 + returnPercent * holdTime)
                        : holdenYear.profitsOnSale * targetEM;
            }
        } else {
            // Original recurring investment logic
            if (years.length >= holdTime) {
                profitsOnSale =
                    (holdenYear.profitsOnSale - newInvestments) * targetEM +
                    newInvestments * (1 + returnPercent * holdTime);
            }
        }
        const subtractNewInvestments =
            initial.investmentType === 'oneTimePayment' ? 0 : newInvestments;
        const endingInvestedBalance =
            totalInvested - subtractNewInvestments + profitsOnSale;
        return {
            number: years.length,
            totalInvested,
            prefferedReturn,
            profitsOnSale,
            endingInvestedBalance,
            cashFlow: prefferedReturn / 12,
        };
    };
    return {
        newInvestments: initial.newInvestments,
        numberOfInvestments: initial.numberOfInvestments,
        investmentType: initial.investmentType,
        total: 0,
        priceToNumber(value: any) {
            return parseInt(value.split(',').join(''));
        },
        numberToPrice(value: any, cent = true) {
            let [dollars, cents] = parseFloat(value).toFixed(2).split('.');
            dollars = dollars.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            if (!dollars) dollars = '0';
            if (!cents) cents = '0';
            return cent ? `${dollars}.${cents}` : dollars;
        },
        years() {
            const years = [];
            const newInvestments =
                -this.priceToNumber(this.newInvestments) *
                this.priceToNumber(this.numberOfInvestments);
            years.push(year0(newInvestments));
            const maxYears = 30;
            for (let index = 0; index < maxYears; index++) {
                years.push(nextYear(years, newInvestments));
            }
            this.total = years[years.length - 1].endingInvestedBalance;
            return years;
        },
        getBiggerValue() {
            const years = this.years();
            return Math.max(...years.map((y: any) => y.endingInvestedBalance));
        },
        getSmallestValue() {
            const years = this.years();
            return Math.min(...years.map((y: any) => y.endingInvestedBalance));
        },
        toSpecialNotation(value: any) {
            if (value > 1_000_000) {
                return `$ ${Math.floor(value / 1_000_000)}M`;
            } else if (value > 1000) {
                return `$ ${Math.floor(value / 1000)}K`;
            }
            return `$ ${Math.floor(value)}`;
        },
        selectedYears() {
            const years = this.years();
            if (this.investmentType === 'oneTimePayment') {
                return {
                    1: years[1],
                    2: years[2],
                    3: years[2],
                    4: years[4],
                    5: years[5],
                    10: years[10],
                    15: years[15],
                    20: years[20],
                    25: years[25],
                    30: years[30],
                };
            }
            return {
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
            };
        },
    };
}
