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
    // Added function to provide tiered return percent based on year, per client requirements
    function getReturnPercent(year: number) {
        if (year === 1) return 0.024; // Year 1: 2.4%
        if (year === 2) return 0.028; // Year 2: 2.8%
        if (year === 3) return 0.040; // Year 4: 4.0%
        if (year === 4) return 0.040; // Year 2: 4.0%
        if (year === 5) return 0.066; // Year 2: 6.6%
        return 0.040; // Year 6 and beyond: 4.0%
    }
    const nextYear = (years: any, newInvestments: any) => {
        const yearNumber = years.length;
        const previousYear = years[years.length - 1];
        const holdenYear =
            years[years.length - holdTime] || year0(newInvestments);

        if (initial.investmentType === 'oneTimePayment') {
            let profitsOnSale = 0;
            let endingInvestedBalance = previousYear.endingInvestedBalance;

            // Sale logic from nextYearMultiFamily
            if (yearNumber > 3 && (yearNumber - 1) % 3 === 0) {
                profitsOnSale =
                    yearNumber === 4
                        ? (holdenYear.profitsOnSale - newInvestments) *
                              targetEM +
                          newInvestments *
                              (1 + getReturnPercent(yearNumber) * holdTime)
                        : holdenYear.profitsOnSale * targetEM;
                endingInvestedBalance += profitsOnSale;
            }

            const prefferedReturn =
                endingInvestedBalance * getReturnPercent(yearNumber);

            return {
                number: yearNumber,
                totalInvested: previousYear.endingInvestedBalance,
                prefferedReturn,
                profitsOnSale,
                endingInvestedBalance,
                cashFlow: prefferedReturn / 12,
            };
        } else {
            // This is the old logic for annual which user says is correct.
            const totalInvested = previousYear.endingInvestedBalance;
            const prefferedReturn =
                totalInvested * getReturnPercent(years.length);
            let profitsOnSale = 0;
            if (years.length >= holdTime) {
                profitsOnSale =
                    (holdenYear.profitsOnSale - newInvestments) * targetEM +
                    newInvestments *
                        (1 + getReturnPercent(years.length) * holdTime);
            }
            const subtractNewInvestments = newInvestments;
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
        }
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
                    3: years[3],
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
                1: {
                    ...years[1],
                    endingInvestedBalance: years[0].endingInvestedBalance,
                },
                2: {
                    ...years[2],
                    endingInvestedBalance: years[1].endingInvestedBalance,
                },
                3: {
                    ...years[3],
                    endingInvestedBalance: years[2].endingInvestedBalance,
                },
                4: {
                    ...years[4],
                    endingInvestedBalance: years[3].endingInvestedBalance,
                },
                5: {
                    ...years[5],
                    endingInvestedBalance: years[4].endingInvestedBalance,
                },
                10: {
                    ...years[10],
                    endingInvestedBalance: years[9].endingInvestedBalance,
                },
                15: {
                    ...years[15],
                    endingInvestedBalance: years[14].endingInvestedBalance,
                },
                20: {
                    ...years[20],
                    endingInvestedBalance: years[19].endingInvestedBalance,
                },
                25: {
                    ...years[25],
                    endingInvestedBalance: years[24].endingInvestedBalance,
                },
                30: {
                    ...years[30],
                    endingInvestedBalance: years[29].endingInvestedBalance,
                },
            };
        },
    };
}
