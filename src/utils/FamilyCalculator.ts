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

    // Added function to provide tiered return percent based on year, per client requirements
    function getReturnPercent(year: number) {
        if (year === 1) return 0.024; // Year 1: 2.4%
        if (year === 2) return 0.028; // Year 2: 2.8%
        if (year === 3) return 0.040; // Year 4: 4.0%
        if (year === 4) return 0.040; // Year 2: 4.0%
        if (year === 5) return 0.066; // Year 2: 6.6%
        return 0.040; // Year 6 and beyond: 4.0%
    }

    const nextYearSingleFamily = (years: any, newInvestments: any) => {
        const previousYear = years[years.length - 1];
        const holdenYear =
            years[years.length - holdTime] || year0(newInvestments);
        const totalInvested = previousYear.endingInvestedBalance;
        // Changed to use tiered return percent based on year (years.length)
        const prefferedReturn =
            totalInvested * getReturnPercent(years.length);
            console.log(years.length,"year",getReturnPercent(years.length),"returnPercent")
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

    const nextYearMultiFamily = (years:any, newInvestments: any) => {
        const yearNumber = years.length;
        const previousYear = years[years.length - 1];
        const holdenYear = years[years.length - holdTime] || year0(newInvestments, true);
        let profitsOnSale = 0;
        let endingInvestedBalance = previousYear.endingInvestedBalance;
    
        // Only apply sale logic for years after the first 3 years (i.e., year 4, 7, 10, ...)
        if (yearNumber > 3 && (yearNumber - 1) % 3 === 0) {
            profitsOnSale =
                yearNumber === 4
                    ? (holdenYear.profitsOnSale - newInvestments) * multiFamilyConfig.targetEM +
                      newInvestments * (1 + getReturnPercent(yearNumber) * holdTime)
                    : holdenYear.profitsOnSale * multiFamilyConfig.targetEM;
            endingInvestedBalance += profitsOnSale;
        }
    
        const prefferedReturn = endingInvestedBalance * getReturnPercent(yearNumber);
    
        return {
            number: yearNumber,
            totalInvested: previousYear.endingInvestedBalance,
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
