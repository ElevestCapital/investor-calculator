export default function calculator() {
    const urlParams = new URLSearchParams(window.location.search);
    const initial = {
        numberOfProperties: urlParams.get('numberOfProperties'),
        monthlyCashflow: urlParams.get('monthlyCashflow') ?? '0',
        totalValue: urlParams.get('totalValue') ?? '0',
        totalOwed: urlParams.get('totalOwed') ?? '0',
    };

    // Common configuration
    const holdTime = 3;

    // Single Family specific config
    const singleFamilyConfig = {
        returnPercent: 0.046,
        targetEM: 1.8,
        equityIncreasePercent: 0.035, // 3.5% equity increase
        equityIncreaseInterval: 1, // years
    };

    // Multi Family specific config
    const multiFamilyConfig = {
        returnPercent: 0.046,
        targetEM: 1.8,
    };

    const year0 = (newInvestments: number, isMultiFamily = false) => ({
        number: 0,
        totalInvested: 0,
        prefferedReturn: 0,
        profitsOnSale: 0,
        endingInvestedBalance: -newInvestments,
        cashFlow: isMultiFamily ? 0 : initial.monthlyCashflow,
        anualCashflow: isMultiFamily
            ? 0
            : parseFloat(initial.monthlyCashflow) * 12,
    });

    const nextYearSingleFamily = (years: any, newInvestments: any) => {
        const previousYear = years[years.length - 1];
        const holdenYear =
            years[years.length - holdTime] || year0(newInvestments);
        const totalInvested = previousYear.endingInvestedBalance;
        const prefferedReturn =
            totalInvested * singleFamilyConfig.returnPercent;
        let profitsOnSale = 0;

        let endingInvestedBalance = totalInvested + profitsOnSale;

        // Add equity increase every 3 years starting from year 2
        if (
            years.length > 1 && // Skip year 1
            (years.length + 1) % singleFamilyConfig.equityIncreaseInterval === 0
        ) {
            endingInvestedBalance *=
                1 + singleFamilyConfig.equityIncreasePercent;
        }

        return {
            number: years.length,
            totalInvested,
            prefferedReturn,
            profitsOnSale,
            endingInvestedBalance,
            cashFlow: initial.monthlyCashflow,
            anualCashflow: parseFloat(initial.monthlyCashflow) * 12,
        };
    };

    const nextYearMultiFamily = (years: any, newInvestments: any) => {
        const previousYear = years[years.length - 1];
        const holdenYear =
            years[years.length - holdTime] || year0(newInvestments, true);
        const totalInvested = previousYear.endingInvestedBalance;
        const prefferedReturn = totalInvested * multiFamilyConfig.returnPercent;
        let profitsOnSale = 0;

        if (years.length % 3 === 0) {
            profitsOnSale =
                years.length === 3
                    ? (holdenYear.profitsOnSale - newInvestments) *
                          multiFamilyConfig.targetEM +
                      newInvestments *
                          (1 + multiFamilyConfig.returnPercent * holdTime)
                    : holdenYear.profitsOnSale * multiFamilyConfig.targetEM;
        }

        const endingInvestedBalance = totalInvested + profitsOnSale;

        return {
            number: years.length,
            totalInvested,
            prefferedReturn,
            profitsOnSale,
            endingInvestedBalance,
            cashFlow: prefferedReturn / 12,
            anualCashflow: prefferedReturn,
        };
    };

    return {
        monthlyCashflow: initial.monthlyCashflow,
        anualCashflow: parseFloat(initial.monthlyCashflow) * 12,
        newInvestments:
            parseFloat(initial.totalValue) - parseFloat(initial.totalOwed),
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
        calculateSingleFamilyYears() {
            const years = [];
            const newInvestments = -this.newInvestments;
            years.push(year0(newInvestments));
            const maxYears = 30;
            for (let index = 0; index < maxYears; index++) {
                years.push(nextYearSingleFamily(years, newInvestments));
            }
            this.total = years[years.length - 1].endingInvestedBalance;
            return years;
        },
        calculateMultiFamilyYears() {
            const years = [];
            const newInvestments = -this.newInvestments;
            years.push(year0(newInvestments, true));
            const maxYears = 30;
            for (let index = 0; index < maxYears; index++) {
                years.push(nextYearMultiFamily(years, newInvestments));
            }
            return years;
        },
        getBiggerValue() {
            const years = this.calculateSingleFamilyYears();
            return Math.max(...years.map((y: any) => y.endingInvestedBalance));
        },
        getSmallestValue() {
            const years = this.calculateSingleFamilyYears();
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
        singleFamilySelectedYears() {
            const years = this.calculateSingleFamilyYears();
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
        multiFamilySelectedYears() {
            const years = this.calculateMultiFamilyYears();
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
        },
    };
}
