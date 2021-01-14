/**
 * Class used to represent a FFM/LBM measurement. Contains the 
 * technique used to measure FFM/LBM and the actual measurement.
 */
class BodyFatMeasurement{
 
    /**
     * Constructor assumes all parameters are valid and does no
     * checking for object types or errors.
     * 
     * @param measurement  the BF% of the user, represented as a decimal. For
     *                          example, if the user's BF% is 17%, then the constructor
     *                          is expecting measurement to be 0.17 .
     * @param technique    the technique used to measure FFM.
     * @param userWeightKG the weight of the user that this measurement is from in kg.
     */
    constructor(measurement,technique,userWeightKG){
        this.measurement = measurement;
        this.technique = technique;
        this.userWeightKG = userWeightKG;
    }

    /**
     * Returns the user's FM in kg. This object knows the 
     * user's total mass and body fat percentage. Given that
     * information, we can calculate the user's 
     */
    getFM(){
        const FAT_MASS_KG = (this.userWeightKG * this.measurement);
        return FAT_MASS_KG;
    }

    /**
     * Returns the user's FFM in kg. This object knows the 
     * user's total mass and body fat percentage. Given that
     * information, we can calculate the user's FM and then 
     * subtract that from their total mass to calculate FFM.
     */
    getFFM(){
        const FAT_MASS_KG = this.getFM();
        const TOTAL_MASS_KG = this.userWeightKG;
        const LEAN_MASS_KG = (TOTAL_MASS_KG - FAT_MASS_KG);
        return LEAN_MASS_KG;
    }
}

/**
 * Class used to represent a person/the user accessing the 
 * web page and requesting a TDEE estimation.
 */
class User{
 
    /**
     * Constructor assumes all parameters are valid and does no
     * checking for object types or errors.
     * 
     * @param heightCM       the user's height in cm 
     * @param weightKG       the user's weight in kg
     * @param isMale         true if the user is male, false if they are female
     * @param activityLevel  a constant used to represent the user's activity level
     * @param ageYears       the user's age in years
     * @param athleteType    null if the user is not an athlete. otherwise a string that 
     *                                  represents what type of athlete the user is.
     * @param bodyFat        the user's FFM/LBM. Null if the measurement is unknown. 
     */
    constructor(heightCM, weightKG, isMale, activityLevel, ageYears, athleteType, bodyFat ){
        this.heightCM = heightCM;
        this.weightKG = weightKG;
        this.isMale = isMale;
        this.activityLevel = activityLevel;
        this.ageYears = ageYears;
        this.athleteType = athleteType;
        this.bodyFat = bodyFat;
    }

    /**
     * Returns the activity level multiplier associated with a 
     * users activity level.
     */
    getActivityMultiplier(){
        //stub
    }
}

/**
 * Class used to represent the different equations that are used to estimate RMR.
 */
class EnergyEquation{
 
    /**
     * Constructor assumes all parameters are valid and does no
     * checking for object types or errors.
     * 
     * @param name     name of the RMR estimation model/equation
     * @param estimate a function that accepts a user object and 
     *                      estimates their TDEE as a number
     */
    constructor(name,estimate){
        this.name = name;
        this.estimate = estimate;
    }
 
    /**
     * Returns a string that contains the name of the equation and 
     * the result of an RMR estimation for a given user object.
     */
    getEstimateOfRMR(person){
        return (this.name + ": " + this.estimate(person));
    }

    /**
     * Returns a string that contains the name of the equation and 
     * the result of a TDEE estimation for a given user object.
     */
    getEstimateOfTDEE(person){
        return (this.name + ": " + (this.estimate(person) * user.getActivityMultiplier()));
    }
}

/**
 * This variable is returned from all of the form submission handlers 
 * because returning false from a javascript form will prevent the 
 * page form reloading.
 */
const PREVENT_PAGE_RELOAD = false;

/**
 * Calculates RMR using equation from Tinsley et al. to predict RMR (given FFM).
 *      RMR = 25.9 * FFM + 284
 */
const TINSLEY_RMR_EQUATION_FFM = new EnergyEquation("Tinsley", (user) => {
    const RMR = ((25.9 * user.bodyFat.getFFM() ) + 284);
    return RMR;
});

/**
 * Calculates RMR using equation from Tinsley et al. to predict RMR (NOT given FFM).
 *      RMR = 24.8 * BW + 10
 */
const TINSLEY_RMR_EQUATION_BW = new EnergyEquation("Tinsley", (user) => {
    const RMR = ((24.8 * user.weightKG ) + 10);
    return RMR;
});

/**
 * Calculates RMR using equation from ten Haaf and Weijs to predict RMR (given FFM).
 *      RMR = 0.239(95.272 * FFM + 2026.161)
 */
const TEN_HAAF_RMR_EQUATION_FFM = new EnergyEquation("ten Haaf", (user) => {
    const RMR = (0.24 * ((95.27 * user.bodyFat.getFFM()) + 2026.16));
    return RMR;
});

/**
 * Calculates RMR using equation from ten Haaf and Weijs to predict RMR (NOT given FFM).
 *      sex(M = 1,F = 0)
 *      RMR = 0.239(49.94 * BW + 24.59 * H - 34.014 * age + 799.257 * sex + 122.502)
 */
const TEN_HAAF_RMR_EQUATION_BW = new EnergyEquation("ten Haaf", (user) => {
    let sex = 0;
    if(user.isMale == true){
        sex = 1;
    }
    const RMR = (0.24 * (((49.94 * user.weightKG) + (24.59 * user.heightCM) - (34.01 * user.ageYears) + (799.26 * sex)) + 122.5));
    return RMR;
});

/**
 * Calculates RMR using equation from Mifflin et al. to predict RMR (given FFM).
 *      RMR = 19.7 * FFM + 413
 */
const MIFFLIN_RMR_EQUATION_FFM = new EnergyEquation("Mifflin-St. Joer", (user) => {
    const RMR = ((19.7 * user.bodyFat.getFFM() ) + 413);
    return RMR;
});

/**
 * Calculates RMR using equation from Mifflin et al. to predict RMR (NOT given FFM).
 *      sex(M = 1,F = 0)
 *      RMR = 9.99 * BW + 6.25 * H - 4.92 * age + 166 * sex - 161
 */
const MIFFLIN_RMR_EQUATION_BW = new EnergyEquation("Mifflin-St. Joer", (user) => {
    let sex = 0;
    if(user.isMale == true){
        sex = 1;
    }
    const RMR = ((9.99 * user.weightKG) + (6.25 * user.heightCM) - (4.92 * user.ageYears) + (166 * sex) - 161);
    return RMR;
});

/**
 * Calculates RMR using equation from Cunningham to predict RMR.
 *      RMR = 21.6 * FFM + 370 
 */
const CUNNINGHAM_RMR_EQUATION = new EnergyEquation("Cunnigham", (user) => {
    const RMR = ((21.6 * user.bodyFat.getFFM()) + 370 );
    return RMR;
});

/**
 * Calculates RMR using equation from Owen et al to predict RMR (given FFM).
 *      Male~RMR   = 22.3 * FFM + 290
 *      Female~RMR = 19.7 * FFM + 334
 */
const OWEN_RMR_EQUATION_FFM = new EnergyEquation("Owen", (user) => {
    let RMR = 0;
    const userIsMale = (user.isMale == true);
    const userIsFemale = (user.isMale == false);
    if( userIsMale){
        RMR = ((22.3 * user.bodyFat.getFFM()) + 290);
    }
    else if(userIsFemale){
        RMR = ((19.7 * user.bodyFat.getFFM()) + 334);
    }
    return RMR;
});

/**
 * Calculates RMR using equation from Owen et al to predict RMR (NOT given FFM).
 *      Male~RMR           = 879 + 10.2 * BW
 *      Female~RMR         = 795 + 7.18 * BW
 *      Female Athlete~RMR = 50.4 + 21.1m
 */
const OWEN_RMR_EQUATION_BW = new EnergyEquation("Owen", (user) => {
    let RMR = 0;
    const userIsMale = (user.isMale == true);
    const userIsFemale = (user.isMale == false);
    const userIsAthlete = (user.athleteType != null);
    if( userIsMale){
        RMR = (879 + (10.2 * user.weightKG));
    }
    else if(userIsFemale){
        if(userIsAthlete){
            RMR = (50.4 + (21.1 * user.weightKG));
        }
        else{
            RMR = (795 + (7.18 * user.weightKG));
        }
    }
    return RMR;
});

/**
 * Calculates RMR using equation from Müller et al. to predict RMR (given FFM).
 *      sex(M = 1,F = 0)
 *      RMR = 0.239(0.05192(FFM) + 0.04036(FM) + 0.869 * sex - 0.01181 * age + 2.992)
 */
const MULLER_RMR_EQUATION_FFM = new EnergyEquation("Müller", (user) => {
    let sex = 0;
    if(user.isMale == true){
        sex = 1;
    }
    const RMR = (0.24 * ((0.05 * user.bodyFat.getFFM()) + (0.04 * user.bodyFat.getFM()) + (0.87 * sex) - (0.01 * user.ageYears) + 2.99));
    return RMR;
});

/**
 * Calculates RMR using equation from Müller et al. to predict RMR (NOT given FFM).
 *      sex(M = 1,F = 0)
 *      RMR = 0.239(0.047 * BW  + 1.009 * sex - 0.01452 * age + 3.21)
 */
const MULLER_RMR_EQUATION_BW = new EnergyEquation("Müller", (user) => {
    let sex = 0;
    if(user.isMale == true){
        sex = 1;
    }
    const RMR = (0.24 * ((0.05 * user.weightKG) + (1 * sex) - (0.01 * user.ageYears) + 3.21));
    return RMR;
});

/**
 * Calculates RMR using equation from De Lorenzo et al to predict RMR.
 *      RMR = 9 * BW + 11.7 * H - 857
 */
const DE_LORENZO_RMR_EQUATION = new EnergyEquation("De Lorenzo", (user) => {
    const RMR = ((9 * user.weightKG) + (11.7 * user.heightCM) - 857);
    return RMR;
});

/**
 * Constant used for athlete type when the user is a physique athlete.
 */
ATHLETE_TYPE_PHYSIQUE = "physique";

/**
 * Constant used for athlete type when the user is a sport athlete.
 */
ATHLETE_TYPE_SPORT = "sport";

/**
 * Constant used for FFM measurement technique type of skinfold.
 */
FFM_TECHNIQUE_SKINFOLD = "skinfold";

/**
 * Constant used for FFM measurement technique type of DXA.
 */
FFM_TECHNIQUE_DXA = "dxa";

/**
 * Constant used for FFM measurement technique type of UWW.
 */
FFM_TECHNIQUE_UWW = "uww";

/**
 * Constant used for FFM measurement technique type of BIA.
 */
FFM_TECHNIQUE_BIA = "bia";

/**
 * Given a user object, returns the optimal equation to estimate TDEE for that user.
 */
function getOptimalEquationForTDEE(user){
    let optimalEq;
    const userKnowsFFM = (user.bodyFat != null);
    const userIsAthlete = (user.athleteType != null);
    const isSportAthlete = (user.athleteType == ATHLETE_TYPE_SPORT);
    const isPhysiqueAthlete = (user.athleteType == ATHLETE_TYPE_PHYSIQUE);
    const userIsMale = (user.isMale == true);
    const userIsFemale = (user.isMale == false);
    if(userKnowsFFM){
        if(userIsAthlete){
            if(isPhysiqueAthlete){
                optimalEq = TINSLEY_RMR_EQUATION_FFM;
            }
            else if( isSportAthlete){
                optimalEq = TEN_HAAF_RMR_EQUATION_FFM;
            }
        }
        else{
            const determinedBySkinfold = (user.bodyFat.technique == FFM_TECHNIQUE_SKINFOLD);
            const determinedByDXA = (user.bodyFat.technique == FFM_TECHNIQUE_DXA);
            const determinedByUWW = (user.bodyFat.technique == FFM_TECHNIQUE_UWW);
            const determinedByBIA = (user.bodyFat.technique == FFM_TECHNIQUE_BIA);
            if(determinedBySkinfold){
                optimalEq = MIFFLIN_RMR_EQUATION_FFM;
            }
            else if(determinedByDXA){
                optimalEq = CUNNINGHAM_RMR_EQUATION;
            }
            else if(determinedByUWW){
                optimalEq = OWEN_RMR_EQUATION_FFM;
            }
            else if( determinedByBIA){
                optimalEq = MULLER_RMR_EQUATION_FFM;
            }
        }
    }
    else{
        if(userIsAthlete){
            if(isPhysiqueAthlete){
                optimalEq = TINSLEY_RMR_EQUATION_BW;
            }
            else if( isSportAthlete){
                if(userIsMale){
                    optimalEq = DE_LORENZO_RMR_EQUATION;
                }
                else if(userIsFemale){
                    optimalEq = TEN_HAAF_RMR_EQUATION_BW;
                }
            }
        }
        else{
            if(userIsMale){
                optimalEq = MIFFLIN_RMR_EQUATION_BW;
            }
            else if(userIsFemale){
                optimalEq = OWEN_RMR_EQUATION_BW;
            }
        }
    }
    return optimalEq;
}

console.log("Hello World");

