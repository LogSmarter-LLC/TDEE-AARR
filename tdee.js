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
    constructor(heightInches, weightPounds, isMale, activityLevel, ageYears ){
        this.heightInches = heightInches;
        this.weightPounds = weightPounds;
        this.isMale = isMale;
        this.activityLevel = activityLevel;
        this.ageYears = ageYears;
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
TINSLEY_TDEE_EQUATION = EnergyEquation("Tinsley", (user)=>{
    const TDEE;
    return TDEE;
});

/**
 * 
 */
TEN_HAAF_TDEE_EQUATION = EnergyEquation("ten Haaf", (user)=>{
    const TDEE;
    return TDEE;
});

/**
 * 
 */
MIFFLIN_TDEE_EQUATION = EnergyEquation("Mifflin-St. Joer", (user)=>{
    const TDEE;
    return TDEE;
});

/**
 * 
 */
CUNNINGHAM_TDEE_EQUATION = EnergyEquation("Cunnigham", (user)=>{
    const TDEE;
    return TDEE;
});

/**
 * 
 */
OWEN_TDEE_EQUATION = EnergyEquation("Owen", (user)=>{
    const TDEE;
    return TDEE;
});

/**
 * 
 */
MULLER_TDEE_EQUATION = EnergyEquation("Müller", (user)=>{
    const TDEE;
    return TDEE;
});

/**
 * 
 */
DE_LORENZO_TDEE_EQUATION = EnergyEquation("De Lorenzo", (user)=>{
    const TDEE;
    return TDEE;
});

console.log("Hello World");

