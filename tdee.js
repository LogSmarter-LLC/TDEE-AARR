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
const ATHLETE_TYPE_PHYSIQUE = "Physique";

/**
 * Constant used for athlete type when the user is a sport athlete.
 */
const ATHLETE_TYPE_SPORT = "Sport";

/**
 * Constant used for FFM measurement technique type of skinfold.
 */
const FFM_TECHNIQUE_SKINFOLD = "Skinfold";

/**
 * Constant used for FFM measurement technique type of DXA.
 */
const FFM_TECHNIQUE_DXA = "DXA";

/**
 * Constant used for FFM measurement technique type of UWW.
 */
const FFM_TECHNIQUE_UWW = "UWW";

/**
 * Constant used for FFM measurement technique type of BIA.
 */
const FFM_TECHNIQUE_BIA = "BIA";

/**
 * Constant used for setting the pages number system to imperial.
 */
const NUM_SYSTEM_IMPERIAL = "Imperial";

/**
 * Constant used for setting the pages number system to metric.
 */
const NUM_SYSTEM_METRIC = "Metric";

/**
 * Constant used for a user gender of male in the page's form.
 */
const GENDER_MALE = "Male";

/**
 * Constant used for a user gender of male in the page's form.
 */
const GENDER_FEMALE = "Female";

/**
 * Key used to refer to user activity level when sedentary.
 */
const ACTIVITY_LEVEL_SEDENTARY = "Sedentary";

/**
* Key used to refer to user activity level when lightly active.
*/
const ACTIVITY_LEVEL_LIGHTLY_ACTIVE = "Lightly Active";

/**
* Key used to refer to user activity level when  active.
*/
const ACTIVITY_LEVEL_ACTIVE = "Active";

/**
* Key used to refer to user activity level when very active.
*/
const ACTIVITY_LEVEL_VERY_ACTIVE = "Very Active";

/**
* This variable holds the value of the current number system that 
* is displayed by the form. By default the number system is imperial.
*/
let currentNumberSystem;

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

/**
 * Given the id of a select, adds an option with the value of 
 * each string in the optionValues array. If the startWithNoValue
 * variable is true, then an empty option is added to the form control 
 * and set as the currently selected option. The function clears any 
 * existing options before adding new options to the select.
 * 
 * @param elementId        Id of the select.
 * @param optionValues     Array of strings of option values to add to the select.
 * @param startWithNoValue True if an empty option should be the default value for the control
 */
function setSelectById(elementId,optionValues, startWithNoValue){
    const select = document.getElementById(elementId);
    const lengthOfCurrentOptions = select.options.length;
    if(lengthOfCurrentOptions > 0){
        for( let optionIdx = (select.options.length-1); optionIdx > -1; optionIdx--){
            select.options[optionIdx] = null;
        }
    }
    const emptyOption = document.createElement("option");
    emptyOption.disabled = true;
    emptyOption.text = "";
    emptyOption.selected = startWithNoValue;
    select.add(emptyOption);
    optionValues.forEach( optionValue => {
        const optionElement = document.createElement("option");
        optionElement.text = optionValue;
        select.add(optionElement);
    });
}

/**
 * Handles setting the initial state of all forms on the page and resetting the 
 * form. If the form has not been set yet, the the current number system is null.
 * If the current number system is null, then the page defaults to the imperial 
 * number system. Any futher calls to this function will result in all form fields
 * being cleared except for the number system field. This is in case anyone is repeatedly
 * calculating TDEE using this form, if so then it would be a bad user experience to
 * repeatedly change the number system.
 */
function resetForm(){
    const numberSystemNotSet = (currentNumberSystem == null)
    if(numberSystemNotSet){
        setSelectById("numberSystem", [NUM_SYSTEM_IMPERIAL,NUM_SYSTEM_METRIC]);
        numberSystemChange();
        document.getElementById("reset").addEventListener("click",resetForm);
    }
    setSelectById("gender", [GENDER_MALE,GENDER_FEMALE], true);
    setSelectById("athleteType", [ATHLETE_TYPE_PHYSIQUE,ATHLETE_TYPE_SPORT],true);
    setSelectById("bodyFatPercentageTechnique",[FFM_TECHNIQUE_SKINFOLD,FFM_TECHNIQUE_DXA,FFM_TECHNIQUE_UWW,FFM_TECHNIQUE_BIA],true);
    setSelectById("activityLevel",[ACTIVITY_LEVEL_SEDENTARY,ACTIVITY_LEVEL_LIGHTLY_ACTIVE,ACTIVITY_LEVEL_ACTIVE,ACTIVITY_LEVEL_VERY_ACTIVE],true);
}

/**
 * Listens to selection changes from the number system div in case the 
 * UI needs to be updated to hide/show form controls based on the current 
 * number system.
 */
function numberSystemChange(){
    const userSelectedNumberSystem = document.getElementById("numberSystem").value;
    const numberSystemIsNullOrDifferent = (currentNumberSystem != userSelectedNumberSystem || currentNumberSystem == null);
    if(numberSystemIsNullOrDifferent){
        currentNumberSystem = userSelectedNumberSystem;
        const classOfElementsToShow = currentNumberSystem.toLowerCase();
        let classOfElementsToHide;
        if(currentNumberSystem == NUM_SYSTEM_IMPERIAL){
            classOfElementsToHide = NUM_SYSTEM_METRIC.toLowerCase();
        }
        else if(currentNumberSystem == NUM_SYSTEM_METRIC ){
            classOfElementsToHide = NUM_SYSTEM_IMPERIAL.toLowerCase();
        }
        const elementsToHide = document.getElementsByClassName(classOfElementsToHide);
        const elementsToShow = document.getElementsByClassName(classOfElementsToShow);
        if(elementsToHide && elementsToHide.length > 0){
            Array.prototype.forEach.call(elementsToHide,element=>element.style.display="none");
        }
        if(elementsToShow && elementsToShow.length > 0){
            Array.prototype.forEach.call(elementsToShow,element=>element.style.display="initial");
        }
    }
}

/**
 * TDEE calculator form submission handler
 */
function handleSubmission(){
    console.log("yeah you submitted")
    return PREVENT_PAGE_RELOAD;
}

/**
 * Waits for DOM to load before calling any setup functions.
 */
document.addEventListener("DOMContentLoaded", resetForm);
