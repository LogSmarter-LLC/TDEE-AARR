/**
 * Class used to represent a FFM/LBM measurement. Contains the 
 * technique used to measure FFM/LBM and the actual measurement.
 */
class FatFreeMassMeasurement{
 
    /**
     * Constructor assumes all parameters are valid and does no
     * checking for object types or errors.
     * 
     * @param measurement the value of the user's FFM.
     * @param technique   the technique used to measure FFM.
     */
    constructor(measurement,technique){
        this.measurement = measurement;
        this.technique = technique;
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
     * @param heightInches   the user's height in inches 
     * @param weightPounds   the user's weight in pounds
     * @param isMale         true if the user is male, false if they are female
     * @param activityLevel  a constant used to represent the user's activity level
     * @param ageYears       the user's age in years
     * @param athleteType    null if the user is not an athlete. otherwise a string that 
     *                                  represents what type of athlete the user is.
     * @param fatFreeMass    the user's FFM/LBM. Null if the measurement is unkown. 
     */
    constructor(heightInches, weightPounds, isMale, activityLevel, ageYears, athleteType, fatFreeMass ){
        this.heightInches = heightInches;
        this.weightPounds = weightPounds;
        this.isMale = isMale;
        this.activityLevel = activityLevel;
        this.ageYears = ageYears;
        this.athleteType = athleteType;
        this.fatFreeMass = fatFreeMass;
    }
 
}

/**
 * Class used to represent the different equations that are used to estimate TDEE.
 */
class EnergyEquation{
 
    /**
     * Constructor assumes all parameters are valid and does no
     * checking for object types or errors.
     * 
     * @param name name of the TDEE estimation model/equation
     * @param estimate a function that accepts a user object and 
     *                      estimates their TDEE as a number
     */
    constructor(name,estimate){
        this.name = name;
        this.estimate = estimate;
    }
 
    /**
     * Returns a string that contains the name of the equation and 
     * the result of an estimation for a given user object.
     */
    getEstimate(person){
        return (this.name + ": " + this.estimate(person));
    }
}

/**
 * This variable is returned from all of the form submission handlers 
 * because returning false from a javascript form will prevent the 
 * page form reloading.
 */
const PREVENT_PAGE_RELOAD = false;

/**
 * 
 */
const TINSLEY_TDEE_EQUATION = new EnergyEquation("Tinsley", (user)=>{
    const TDEE = 0;
    return TDEE;
});

/**
 * 
 */
const TEN_HAAF_TDEE_EQUATION = new EnergyEquation("ten Haaf", (user)=>{
    const TDEE = 0;
    return TDEE;
});

/**
 * 
 */
const MIFFLIN_TDEE_EQUATION = new EnergyEquation("Mifflin-St. Joer", (user)=>{
    const TDEE = 0;
    return TDEE;
});

/**
 * 
 */
const CUNNINGHAM_TDEE_EQUATION = new EnergyEquation("Cunnigham", (user)=>{
    const TDEE = 0;
    return TDEE;
});

/**
 * 
 */
const OWEN_TDEE_EQUATION = new EnergyEquation("Owen", (user)=>{
    const TDEE = 0;
    return TDEE;
});

/**
 * 
 */
const MULLER_TDEE_EQUATION = new EnergyEquation("Müller", (user)=>{
    const TDEE = 0;
    return TDEE;
});

/**
 * 
 */
const DE_LORENZO_TDEE_EQUATION = new EnergyEquation("De Lorenzo", (user)=>{
    const TDEE = 0;
    return TDEE;
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
 * Constant used for FFM measurement technique type of skinfold
 */
FFM_TECHNIQUE_SKINFOLD = "skinfold";

/**
 * Constant used for FFM measurement technique type of DXA
 */
FFM_TECHNIQUE_DXA = "dxa";

/**
 * Constant used for FFM measurement technique type of UWW
 */
FFM_TECHNIQUE_UWW = "uww";

/**
 * Constant used for FFM measurement technique type of BIA
 */
FFM_TECHNIQUE_BIA = "bia";

/**
 * Given a user object, returns the optimal equation to estimate TDEE for that user.
 */
function getOptimalEquationForTDEE(user){
    let optimalEq;
    const userKnowsFFM = (user.fatFreeMass != null);
    const userIsAthlete = (user.athleteType != null);
    const isSportAthlete = (user.athleteType == ATHLETE_TYPE_SPORT);
    const isPhysiqueAthlete = (user.athleteType == ATHLETE_TYPE_PHYSIQUE);
    const userIsMale = (user.isMale == true);
    const userIsFemale = (user.isMale == false);
    if(userKnowsFFM){
        if(userIsAthlete){
            if(isPhysiqueAthlete){
                optimalEq = TINSLEY_TDEE_EQUATION;
            }
            else if( isSportAthlete){
                optimalEq = TEN_HAAF_TDEE_EQUATION;
            }
        }
        else{
            const determinedBySkinfold = (user.fatFreeMass.technique == FFM_TECHNIQUE_SKINFOLD);
            const determinedByDXA = (user.fatFreeMass.technique == FFM_TECHNIQUE_DXA);
            const determinedByUWW = (user.fatFreeMass.technique == FFM_TECHNIQUE_UWW);
            const determinedByBIA = (user.fatFreeMass.technique == FFM_TECHNIQUE_BIA);
            if(determinedBySkinfold){
                optimalEq = MIFFLIN_TDEE_EQUATION;
            }
            else if(determinedByDXA){
                optimalEq = CUNNINGHAM_TDEE_EQUATION;
            }
            else if(determinedByUWW){
                optimalEq = OWEN_TDEE_EQUATION;
            }
            else if( determinedByBIA){
                optimalEq = MULLER_TDEE_EQUATION;
            }
        }
    }
    else{
        if(userIsAthlete){
            if(isPhysiqueAthlete){
                optimalEq = TINSLEY_TDEE_EQUATION;
            }
            else if( isSportAthlete){
                if(userIsMale){
                    optimalEq = DE_LORENZO_TDEE_EQUATION;
                }
                else if(userIsFemale){
                    optimalEq = TEN_HAAF_TDEE_EQUATION;
                }
            }
        }
        else{
            if(userIsMale){
                optimalEq = MIFFLIN_TDEE_EQUATION;
            }
            else if(userIsFemale){
                optimalEq = OWEN_TDEE_EQUATION;
            }
        }
    }
    return optimalEq;
}

console.log("Hello World");

