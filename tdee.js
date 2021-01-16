/**
 * Class used to represent a FFM/LBM measurement. Contains the 
 * technique used to measure FFM/LBM and the actual measurement.
 */
class BodyFatMeasurement {

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
    constructor(measurement, technique, userWeightKG) {
        this.measurement = measurement;
        this.technique = technique;
        this.userWeightKG = userWeightKG;
    }

    /**
     * Returns the user's FM in kg. This object knows the 
     * user's total mass and body fat percentage. Given that
     * information, we can calculate the user's 
     */
    getFM() {
        const FAT_MASS_KG = (this.userWeightKG * this.measurement);
        return FAT_MASS_KG;
    }

    /**
     * Returns the user's FFM in kg. This object knows the 
     * user's total mass and body fat percentage. Given that
     * information, we can calculate the user's FM and then 
     * subtract that from their total mass to calculate FFM.
     */
    getFFM() {
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
class User {

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
    constructor(heightCM, weightKG, isMale, activityLevel, ageYears, athleteType, bodyFat) {
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
     * user's activity level. If the activity level is invalid,
     * then 1 is returned.
     */
    getActivityMultiplier() {
        if (this.activityLevel == ACTIVITY_LEVEL_SEDENTARY) {
            return 1.2;
        }
        else if (this.activityLevel == ACTIVITY_LEVEL_LIGHTLY_ACTIVE) {
            return 1.375;
        }
        else if (this.activityLevel == ACTIVITY_LEVEL_ACTIVE) {
            return 1.55;
        }
        else if (this.activityLevel == ACTIVITY_LEVEL_VERY_ACTIVE) {
            return 1.725;
        }
        else {
            return 1;
        }
    }
}

/**
 * Class used to represent the different equations that are used to estimate RMR.
 */
class EnergyEquation {

    /**
     * Constructor assumes all parameters are valid and does no
     * checking for object types or errors.
     * 
     * @param name      name of the RMR estimation model/equation
     * @param estimate  a function that accepts a user object and 
     *                      estimates their TDEE as a number
     * @param plainTect an array of strings that can be displayed in the UI 
     *                      explaining how the equation works.
     */
    constructor(name, estimate, plainTextEquation) {
        this.name = name;
        this.estimate = estimate;
        this.plainTextEquation = plainTextEquation;
    }

    /**
     * Returns a string that contains the name of the equation and 
     * the result of an RMR estimation for a given user object.
     */
    getEstimateOfRMR(person) {
        return Math.round(this.estimate(person));
    }

    /**
     * Returns a string that contains the name of the equation and 
     * the result of a TDEE estimation for a given user object.
     */
    getEstimateOfTDEE(person) {
        return Math.round(this.estimate(person) * person.getActivityMultiplier());
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
    const RMR = ((25.9 * user.bodyFat.getFFM()) + 284);
    return RMR;
}, ["RMR = 25.9 * fatFreeMass + 284"]);

/**
 * Calculates RMR using equation from Tinsley et al. to predict RMR (NOT given FFM).
 *      RMR = 24.8 * BW + 10
 */
const TINSLEY_RMR_EQUATION_BW = new EnergyEquation("Tinsley", (user) => {
    const RMR = ((24.8 * user.weightKG) + 10);
    return RMR;
}, ["RMR = 24.8 * bodyWeight + 10"]);

/**
 * Calculates RMR using equation from ten Haaf and Weijs to predict RMR (given FFM).
 *      RMR = 0.239(95.272 * FFM + 2026.161)
 */
const TEN_HAAF_RMR_EQUATION_FFM = new EnergyEquation("ten Haaf", (user) => {
    const RMR = (0.24 * ((95.27 * user.bodyFat.getFFM()) + 2026.16));
    return RMR;
}, ["RMR = 0.239(95.272 * fatFreeMass + 2026.161)"]);

/**
 * Calculates RMR using equation from ten Haaf and Weijs to predict RMR (NOT given FFM).
 *      sex(M = 1,F = 0)
 *      RMR = 0.239(49.94 * BW + 24.59 * H - 34.014 * age + 799.257 * sex + 122.502)
 */
const TEN_HAAF_RMR_EQUATION_BW = new EnergyEquation("ten Haaf", (user) => {
    let sex = 0;
    if (user.isMale == true) {
        sex = 1;
    }
    const RMR = (0.24 * (((49.94 * user.weightKG) + (24.59 * user.heightCM) - (34.01 * user.ageYears) + (799.26 * sex)) + 122.5));
    return RMR;
}, ["RMR = 0.239(49.94 * bodyWeight + 24.59 * height - 34.014 * age + 799.257 * sex + 122.502)"]);

/**
 * Calculates RMR using equation from Mifflin et al. to predict RMR (given FFM).
 *      RMR = 19.7 * FFM + 413
 */
const MIFFLIN_RMR_EQUATION_FFM = new EnergyEquation("Mifflin-St. Joer", (user) => {
    const RMR = ((19.7 * user.bodyFat.getFFM()) + 413);
    return RMR;
}, ["RMR = 19.7 * fatFreeMass + 413"]);

/**
 * Calculates RMR using equation from Mifflin et al. to predict RMR (NOT given FFM).
 *      sex(M = 1,F = 0)
 *      RMR = 9.99 * BW + 6.25 * H - 4.92 * age + 166 * sex - 161
 */
const MIFFLIN_RMR_EQUATION_BW = new EnergyEquation("Mifflin-St. Joer", (user) => {
    let sex = 0;
    if (user.isMale == true) {
        sex = 1;
    }
    const RMR = ((9.99 * user.weightKG) + (6.25 * user.heightCM) - (4.92 * user.ageYears) + (166 * sex) - 161);
    return RMR;
}, ["RMR = 9.99 * bodyWeight + 6.25 * height - 4.92 * age + 166 * sex - 161"]);

/**
 * Calculates RMR using equation from Cunningham to predict RMR.
 *      RMR = 21.6 * FFM + 370 
 */
const CUNNINGHAM_RMR_EQUATION = new EnergyEquation("Cunnigham", (user) => {
    const RMR = ((21.6 * user.bodyFat.getFFM()) + 370);
    return RMR;
}, ["RMR = 21.6 * fatFreeMass + 370"]);

/**
 * Calculates RMR using equation from Owen et al to predict RMR (given FFM).
 *      Male~RMR   = 22.3 * FFM + 290
 *      Female~RMR = 19.7 * FFM + 334
 */
const OWEN_RMR_EQUATION_FFM = new EnergyEquation("Owen", (user) => {
    let RMR = 0;
    const userIsMale = (user.isMale == true);
    const userIsFemale = (user.isMale == false);
    if (userIsMale) {
        RMR = ((22.3 * user.bodyFat.getFFM()) + 290);
    }
    else if (userIsFemale) {
        RMR = ((19.7 * user.bodyFat.getFFM()) + 334);
    }
    return RMR;
}, ["Male RMR = 22.3 * fatFreeMass + 290", "Female RMR = 19.7 * fatFreeMass + 334 "]);

/**
 * Calculates RMR using equation from Owen et al to predict RMR (NOT given FFM).
 *      Male~RMR           = 879 + 10.2 * BW
 *      Female~RMR         = 795 + 7.18 * BW
 *      Female Athlete~RMR = 50.4 + 21.1 * BW
 */
const OWEN_RMR_EQUATION_BW = new EnergyEquation("Owen", (user) => {
    let RMR = 0;
    const userIsMale = (user.isMale == true);
    const userIsFemale = (user.isMale == false);
    const userIsAthlete = (user.athleteType != null);
    if (userIsMale) {
        RMR = (879 + (10.2 * user.weightKG));
    }
    else if (userIsFemale) {
        if (userIsAthlete) {
            RMR = (50.4 + (21.1 * user.weightKG));
        }
        else {
            RMR = (795 + (7.18 * user.weightKG));
        }
    }
    return RMR;
}, ["Male RMR = 879 + 10.2 * bodyWeight", "Female RMR = 795 + 7.18 * bodyWeight", "Female Athlete RMR = 50.4 + 21.1 * bodyWeight"]);

/**
 * Calculates RMR using equation from Müller et al. to predict RMR (given FFM).
 *      sex(M = 1,F = 0)
 *      RMR = 239 * (0.05192(FFM) + 0.04036(FM) + 0.869 * sex - 0.01181 * age + 2.992)
 */
const MULLER_RMR_EQUATION_FFM = new EnergyEquation("Muller", (user) => {
    let sex = 0;
    if (user.isMale == true) {
        sex = 1;
    }
    const RMR = (239 * ((0.05 * user.bodyFat.getFFM()) + (0.04 * user.bodyFat.getFM()) + (0.87 * sex) - (0.01 * user.ageYears) + 2.99));
    return RMR;
}, ["RMR = 239 * (0.05192(fatFreeMass) + 0.04036(fatMass) + 0.869 * sex - 0.01181 * age + 2.992)"]);

/**
 * Calculates RMR using equation from Müller et al. to predict RMR (NOT given FFM).
 *      sex(M = 1,F = 0)
 *      RMR = 239 * (0.047 * BW  + 1.009 * sex - 0.01452 * age + 3.21)
 */
const MULLER_RMR_EQUATION_BW = new EnergyEquation("Muller", (user) => {
    let sex = 0;
    if (user.isMale == true) {
        sex = 1;
    }
    const RMR = (239 * ((0.05 * user.weightKG) + (1 * sex) - (0.01 * user.ageYears) + 3.21));
    return RMR;
}, ["RMR = 239 * (0.047 * bodyWeight  + 1.009 * sex - 0.01452 * age + 3.21) "]);

/**
 * Calculates RMR using equation from De Lorenzo et al to predict RMR.
 *      RMR = 9 * BW + 11.7 * H - 857
 */
const DE_LORENZO_RMR_EQUATION = new EnergyEquation("De Lorenzo", (user) => {
    const RMR = ((9 * user.weightKG) + (11.7 * user.heightCM) - 857);
    return RMR;
}, ["RMR = 9 * bodyWeight + 11.7 * height - 857"]);

/**
 * A list of the equations considered by the optimal equation algorithm 
 * if the user knows their FFM.
 */
const FFM_EQUATION_LIST = [
    TINSLEY_RMR_EQUATION_FFM,
    TEN_HAAF_RMR_EQUATION_FFM,
    MIFFLIN_RMR_EQUATION_FFM,
    CUNNINGHAM_RMR_EQUATION,
    OWEN_RMR_EQUATION_FFM,
    MULLER_RMR_EQUATION_FFM
];

/**
 * A list of the equations considered by the optimal equation algorithm 
 * if the user does NOT know their FFM.
 */
const BW_EQUATION_LIST = [
    TINSLEY_RMR_EQUATION_BW,
    DE_LORENZO_RMR_EQUATION,
    TEN_HAAF_RMR_EQUATION_BW,
    MIFFLIN_RMR_EQUATION_BW,
    OWEN_RMR_EQUATION_BW,
    MULLER_RMR_EQUATION_BW
];

/**
 * A complete list of all the equations.
 */
const ALL_EQUATIONS = [
    TINSLEY_RMR_EQUATION_FFM,
    TINSLEY_RMR_EQUATION_BW,
    TEN_HAAF_RMR_EQUATION_FFM,
    TEN_HAAF_RMR_EQUATION_BW,
    MIFFLIN_RMR_EQUATION_FFM,
    MIFFLIN_RMR_EQUATION_BW,
    CUNNINGHAM_RMR_EQUATION,
    OWEN_RMR_EQUATION_FFM,
    OWEN_RMR_EQUATION_BW,
    MULLER_RMR_EQUATION_FFM,
    MULLER_RMR_EQUATION_BW,
    DE_LORENZO_RMR_EQUATION
];

/**
* A list of the equations considered by the optimal equation algorithm 
* if the user does not know their FFM.
*/

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
function getOptimalEquationForTDEE(user) {
    let optimalEq;
    const userKnowsFFM = (user.bodyFat != null);
    const userIsAthlete = (user.athleteType != null);
    const isSportAthlete = (user.athleteType == ATHLETE_TYPE_SPORT);
    const isPhysiqueAthlete = (user.athleteType == ATHLETE_TYPE_PHYSIQUE);
    const userIsMale = (user.isMale == true);
    const userIsFemale = (user.isMale == false);
    if (userKnowsFFM) {
        if (userIsAthlete) {
            if (isPhysiqueAthlete) {
                optimalEq = TINSLEY_RMR_EQUATION_FFM;
            }
            else if (isSportAthlete) {
                optimalEq = TEN_HAAF_RMR_EQUATION_FFM;
            }
        }
        else {
            const determinedBySkinfold = (user.bodyFat.technique == FFM_TECHNIQUE_SKINFOLD);
            const determinedByDXA = (user.bodyFat.technique == FFM_TECHNIQUE_DXA);
            const determinedByUWW = (user.bodyFat.technique == FFM_TECHNIQUE_UWW);
            const determinedByBIA = (user.bodyFat.technique == FFM_TECHNIQUE_BIA);
            if (determinedBySkinfold) {
                optimalEq = MIFFLIN_RMR_EQUATION_FFM;
            }
            else if (determinedByDXA) {
                optimalEq = CUNNINGHAM_RMR_EQUATION;
            }
            else if (determinedByUWW) {
                optimalEq = OWEN_RMR_EQUATION_FFM;
            }
            else if (determinedByBIA) {
                optimalEq = MULLER_RMR_EQUATION_FFM;
            }
        }
    }
    else {
        if (userIsAthlete) {
            if (isPhysiqueAthlete) {
                optimalEq = TINSLEY_RMR_EQUATION_BW;
            }
            else if (isSportAthlete) {
                if (userIsMale) {
                    optimalEq = DE_LORENZO_RMR_EQUATION;
                }
                else if (userIsFemale) {
                    optimalEq = TEN_HAAF_RMR_EQUATION_BW;
                }
            }
        }
        else {
            if (userIsMale) {
                optimalEq = MIFFLIN_RMR_EQUATION_BW;
            }
            else if (userIsFemale) {
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
function setSelectById(elementId, optionValues, startWithNoValue) {
    const select = document.getElementById(elementId);
    const lengthOfCurrentOptions = select.options.length;
    if (lengthOfCurrentOptions > 0) {
        for (let optionIdx = (select.options.length - 1); optionIdx > -1; optionIdx--) {
            select.options[optionIdx] = null;
        }
    }
    const emptyOption = document.createElement("option");
    emptyOption.disabled = true;
    emptyOption.text = "";
    emptyOption.selected = startWithNoValue;
    select.add(emptyOption);
    optionValues.forEach(optionValue => {
        const optionElement = document.createElement("option");
        optionElement.text = optionValue;
        select.add(optionElement);
    });
}

/**
 * Clears the value of an HTML input form field.
 * Used when resetting the state of the TDEE 
 * calculator form.
 */
function clearInputByID(id) {
    const input = document.getElementById(id);
    input.value = "";
}

/**
 * Handles setting the initial state of all forms on the page and resetting the 
 * form. If the form has not been set yet, the current number system is null.
 * If the current number system is null, then the page defaults to the imperial 
 * number system. Any further calls to this function will result in all form fields
 * being cleared except for the number system field. This is in case anyone is repeatedly
 * calculating TDEE using this form, if so then it would be a bad user experience to
 * repeatedly change the number system.
 */
function resetForm() {
    const numberSystemNotSet = (currentNumberSystem == null)
    if (numberSystemNotSet) {
        showForm();
        setSelectById("numberSystem", [NUM_SYSTEM_IMPERIAL, NUM_SYSTEM_METRIC]);
        numberSystemChange();
        document.getElementById("reset").addEventListener("click", resetForm);
        document.getElementById("backToForm").addEventListener("click", showForm);
        buildEquationList();
    }
    setSelectById("gender", [GENDER_MALE, GENDER_FEMALE], true);
    setSelectById("athleteType", [ATHLETE_TYPE_PHYSIQUE, ATHLETE_TYPE_SPORT], true);
    setSelectById("bodyFatPercentageTechnique", [FFM_TECHNIQUE_SKINFOLD, FFM_TECHNIQUE_DXA, FFM_TECHNIQUE_UWW, FFM_TECHNIQUE_BIA], true);
    setSelectById("activityLevel", [ACTIVITY_LEVEL_SEDENTARY, ACTIVITY_LEVEL_LIGHTLY_ACTIVE, ACTIVITY_LEVEL_ACTIVE, ACTIVITY_LEVEL_VERY_ACTIVE], true);
    clearInputByID("age");
    clearInputByID("bodyFatPercentage");
    clearInputByID("weightPounds");
    clearInputByID("weightKG");
    clearInputByID("heightCM");
    clearInputByID("heightInches");
    clearInputByID("heightFeet");
}

/**
 * Listens to selection changes from the number system div in case the 
 * UI needs to be updated to hide/show form controls based on the current 
 * number system.
 */
function numberSystemChange() {
    const userSelectedNumberSystem = document.getElementById("numberSystem").value;
    const numberSystemIsNullOrDifferent = (currentNumberSystem != userSelectedNumberSystem || currentNumberSystem == null);
    if (numberSystemIsNullOrDifferent) {
        currentNumberSystem = userSelectedNumberSystem;
        const classOfElementsToShow = currentNumberSystem.toLowerCase();
        let classOfElementsToHide;
        if (currentNumberSystem == NUM_SYSTEM_IMPERIAL) {
            classOfElementsToHide = NUM_SYSTEM_METRIC.toLowerCase();
        }
        else if (currentNumberSystem == NUM_SYSTEM_METRIC) {
            classOfElementsToHide = NUM_SYSTEM_IMPERIAL.toLowerCase();
        }
        const elementsToHide = document.getElementsByClassName(classOfElementsToHide);
        const elementsToShow = document.getElementsByClassName(classOfElementsToShow);
        if (elementsToHide && elementsToHide.length > 0) {
            Array.prototype.forEach.call(elementsToHide, element => element.style.display = "none");
        }
        if (elementsToShow && elementsToShow.length > 0) {
            Array.prototype.forEach.call(elementsToShow, element => element.style.display = "initial");
        }
    }
    resetForm();
}

/**
 * Rounds a number to a specified number of decimal places, if any error occurs, then
 * the original number passed in is returned as is.
 * 
 * @param num Number to be rounded. 
 * @param dec What decimal place to round the number to.
 */
function roundNumberToSpecifiedDecimalPlace(num, dec) {
    try {
        const multiplier = Math.pow(10, dec || 0);
        const result = Math.round(num * multiplier) / multiplier;
        if (isNaN(result)) {
            return num;
        } else {
            return result;
        }
    } catch (error) {
        return num;
    }
}

/**
 * Rounds a number to one decimal place, if any error occurs, then
 * the original number passed in is returned as is.
 * 
 * @param num Number to be rounded. 
 */
function roundNumberToOneDecimalPlace(num) {
    return roundNumberToSpecifiedDecimalPlace(num, 1);
}

/**
 * Converts a weight in lbs to the equivalent amount of weight in kg and
 * rounds to one decimal place.
 * 
 * @param weight_lbs weight to convert from lbs to kg.
 */
function convertLbsToKg(weight_lbs) {
    return roundNumberToOneDecimalPlace(weight_lbs * 0.454);
}

/**
* Converts a weight in kg to the equivalent amount of weight in lbs and rounds to one decimal place.
* 
* @param weight_kg weight to be converted from kg to lbs.
*/
function convertKgToLbs(weight_kg) {
    return this.roundNumberToOneDecimalPlace(weight_kg / 0.454);
}

/**
 * Converts a height represented in feet and inches to the equivalent height in only inches.
 * Feet and inches are both expected to be integers.
 * 
 * @param feet height measured in feet.
 * @param inches height measured in inches.
 */
function convertFeetAndInchesToInches(feet, inches) {
    const feetIsNegativeorNull = ((feet < 0) || (!feet));
    if (feetIsNegativeorNull) {
        feet = 0;
    }
    const inchesIsNegativeOrNull = ((inches < 0) || (!inches));
    if (inchesIsNegativeOrNull) {
        inches = 0;
    }
    return ((feet * 12) + inches);
}

/**
 * Converts a height in IN to the equivalent amount of height in cm and rounds to one decimal place.
 * 
 * @param height_inches height to be converted from IN to cm.
 */
function convertInchesToCentimeters(height_inches) {
    return roundNumberToOneDecimalPlace(height_inches * 2.54);
}

/**
* Converts a height in CM to the equivalent amount of height in IN and rounds to one decimal place.
* 
* @param height_centimeters height to be converted from cm to IN.
*/
function convertCentimetersToInches(height_centimeters) {
    return this.roundNumberToOneDecimalPlace(height_centimeters / 2.54);
}

/**
 * Converts a height in inches into a display string in the format feet' inches".
 * Expects that inches is an integer. If inches is null or negative, then 
 * an empty string is returned.
 * 
 * @param heightInches  height in inches to be converted.
 */
function convertInchesToString(heightInches) {
    const heightIsNullOrNegative = (heightInches == null || heightInches <= 0)
    if (heightIsNullOrNegative) {
        return "";
    }
    else {
        return Math.floor((heightInches / 12)) + "' " + Math.floor(heightInches % 12) + "\"";
    }
}

/**
 * This function is returned from the submission handler if the user's TDEE
 * cannot be calculated. It displays the error message passed in and then returns
 * false to prevent the page from being reloaded.
 * 
 * @param errorMessage The error message to display in the UI.
 */
function handleSubmissionError(errorMessage) {
    const errorDiv = document.getElementById("errorMessage");
    errorDiv.innerHTML = errorMessage;
    return PREVENT_PAGE_RELOAD;
}

/**
 * This function is used to validate numeric form controls like 
 * height, weight, age and BF%. The only checks done are to ensure
 * that the number is actually a number and that it is greater than 0.  
 * Returns true if the form control is valid. False otherwise.
 * 
 * @param value The value of the form control.
 */
function isValidNumericFormControlValue(value) {
    const valIsANumber = !(isNaN(value));
    const valIsGreaterThanZero = (valIsANumber && (value > 0));
    const isValid = (valIsANumber && valIsGreaterThanZero);
    return isValid;
}

/**
 * Clears the error div of any previous error messages.
 * Called at the very start of handleSubmission to reset
 * the state of the UI.
 */
function clearPreexistingErrors() {
    handleSubmissionError("");
}

/**
 * TDEE calculator form submission handler. Throws errors if any of the required controls 
 * are missing or invalid. Required controls include height, gender, weight, age and 
 * activity level. Also a requirement that the body fat controls are both filled out or
 * both blank. The algorithm for choosing an optimal equation will not work if only 
 * one is filled out.
 * 
 * If the submission is successful, the results of estimating RMR and TDEE with all valid
 * equations is displayed along with a recommendation for which equation is the most likely
 * to be accurate based on our optimal equation algorithm.
 * 
 * If the submission is unsuccessful, then an error message is displayed and the form remains
 * in whatever its current state is.
 */
function handleSubmission() {
    clearPreexistingErrors();
    let heightCM;
    let weightKG;
    if (currentNumberSystem == NUM_SYSTEM_IMPERIAL) {
        let heightFeetValue = parseInt(document.getElementById("heightFeet").value);
        let heightInchesValue = parseInt(document.getElementById("heightInches").value);
        let totalHeightInches = convertFeetAndInchesToInches(heightFeetValue, heightInchesValue);
        heightCM = convertInchesToCentimeters(totalHeightInches);
        let weightPoundsValue = parseFloat(document.getElementById("weightPounds").value);
        weightKG = convertLbsToKg(weightPoundsValue);
    }
    else {
        heightCM = parseInt(document.getElementById("heightCM").value);
        weightKG = parseFloat(document.getElementById("weightKG").value);
    }
    const heightIsInvalid = !(isValidNumericFormControlValue(heightCM));
    if (heightIsInvalid) {
        return handleSubmissionError("Please enter a valid height");
    }
    const weightIsInvalid = !(isValidNumericFormControlValue(weightKG));
    if (weightIsInvalid) {
        return handleSubmissionError("Please enter a valid weight");
    }
    let ageYears;
    const ageControlValue = parseInt(document.getElementById("age").value);
    const ageControlValueIsNotEmpty = (ageControlValue != "");
    if (ageControlValueIsNotEmpty) {
        ageYears = ageControlValue;
    }
    const ageIsInvalid = !(isValidNumericFormControlValue(ageYears));
    if (ageIsInvalid) {
        return handleSubmissionError("Please enter a valid age");
    }
    let isMale;
    const genderControlValue = document.getElementById("gender").value;
    const genderControlValueIsNotEmpty = (genderControlValue != "");
    if (genderControlValueIsNotEmpty) {
        isMale = (genderControlValue == GENDER_MALE);
    }
    else {
        return handleSubmissionError("Please select a valid gender");
    }
    let activityLevel;
    const activtiyLevelControlValue = document.getElementById("activityLevel").value;
    const activtiyLevelControlValueIsNotEmpty = (activtiyLevelControlValue != "");
    if (activtiyLevelControlValueIsNotEmpty) {
        activityLevel = activtiyLevelControlValue;
    }
    else {
        return handleSubmissionError("Please select a valid activity level");
    }
    let athleteType;
    const athleteTypeControlValue = document.getElementById("athleteType").value;
    const athleteTypeControlValueIsNotEmpty = (athleteTypeControlValue != "");
    if (athleteTypeControlValueIsNotEmpty) {
        athleteType = athleteTypeControlValue;
    }
    let bodyFatMeasurement;
    const bodyFatMeasurementControlValue = document.getElementById("bodyFatPercentage").value;
    const bodyFatMeasurementControlValueIsNotEmpty = (bodyFatMeasurementControlValue != "");
    const bodyFatTechniqueControlValue = document.getElementById("bodyFatPercentageTechnique").value;
    const bodyFatTechniqueControlValueIsNotEmpty = (bodyFatTechniqueControlValue != "");
    const oneBodyFatControlGiven = (bodyFatMeasurementControlValueIsNotEmpty || bodyFatTechniqueControlValueIsNotEmpty);
    const measurementAndTechniqueAreNotEmpty = (bodyFatMeasurementControlValueIsNotEmpty && bodyFatTechniqueControlValueIsNotEmpty)
    if (measurementAndTechniqueAreNotEmpty) {
        const bodyFatIsValid = isValidNumericFormControlValue(bodyFatMeasurementControlValue);
        if (bodyFatIsValid) {
            const bodyFatPercentageAsDecimal = (bodyFatMeasurementControlValue / 100);
            bodyFatMeasurement = new BodyFatMeasurement(bodyFatPercentageAsDecimal, bodyFatTechniqueControlValue, weightKG);
        } else {
            return handleSubmissionError("Please enter a valid BF%");
        }
    }
    else if (oneBodyFatControlGiven) {
        return handleSubmissionError("Both BF% fields must be blank or filled out to calculate");
    }
    const user = new User(heightCM, weightKG, isMale, activityLevel, ageYears, athleteType, bodyFatMeasurement);
    displayResults(user);
    return PREVENT_PAGE_RELOAD;
}

/**
 * Hides the TDEE calculator form and displays the results UI
 */
function showResults() {
    document.getElementById("tdeeForm").style.display = "none";
    document.getElementById("formResults").style.display = "block";
}

/**
 * Hides the results UI and displays the TDEE calculator form.
 */
function showForm() {
    document.getElementById("formResults").style.display = "none";
    document.getElementById("tdeeForm").style.display = "block";
}

/**
 * Handles displaying the results of estimating TDEE and RMR for all valid equations
 * that a user can have their TDEE and RMR estimated with based on the information
 * that they provided. This function is only called as a result of a successful
 * submission of the TDEE calculator form.
 * 
 * @param user The user to display results form
 */
function displayResults(user) {
    const optimalEquation = getOptimalEquationForTDEE(user);
    buildDemoStatement(user);
    buildOptimalStatement(optimalEquation);
    buildListOfMultipleTDEE(user, optimalEquation);
    showResults();
    location.href = "#";
    location.href = "#formResults"
}

/**
 * Constructs a list of RMR and TDEE calculations using the equations 
 * that our algorithm considers to build a display in the UI where the user 
 * can see the difference between their estimated TDEE and RMR from the different
 * equations.
 */
function buildListOfMultipleTDEE(user, optimalEQ) {
    const tdeeDiv = document.getElementById("listOfTDEE");
    tdeeDiv.innerHTML = "";
    let equationsToConsider;
    const userKnowsFFM = (user.bodyFat != null);
    if (userKnowsFFM) {
        equationsToConsider = FFM_EQUATION_LIST;
    }
    else {
        equationsToConsider = BW_EQUATION_LIST;
    }
    const addEquationToList = (equation, isOptimalEq) => {
        const optimalHeader = document.createElement("div")
        optimalHeader.innerHTML = equation.name;
        optimalHeader.classList.add("resultsFieldHeader")
        optimalHeader.classList.add("lsThemeText")
        const optimalContent = document.createElement("div");
        optimalContent.classList.add("resultsFieldContent");
        optimalContent.classList.add("equationResult");
        if (isOptimalEq) {
            optimalContent.classList.add("optimalEq");
        }
        optimalContent.innerHTML = ("RMR: " + equation.getEstimateOfRMR(user) + "&nbsp;&nbsp;TDEE: " + equation.getEstimateOfTDEE(user)) + " kcal";
        tdeeDiv.append(optimalHeader);
        tdeeDiv.append(optimalContent);
    }
    addEquationToList(optimalEQ, true);
    equationsToConsider.forEach(equation => {
        if (equation != optimalEQ) {
            addEquationToList(equation, false);
        }
    });
    buildChart(user, equationsToConsider);
}

/**
 * Builds a statement that can be displayed in the UI that given the user's
 * optimal TDEE eequation.
 */
function buildOptimalStatement(optimalEquation) {
    let statment = "Based on your demographic information, we recommend using the ";
    statment += optimalEquation.name;
    statment += " equation to estimate your TDEE.";
    statment += " We highlighted the results we suggest you follow in yellow,";
    statment += " but also calculated your RMR and TDEE using other equations";
    statment += " our calculator considers so you can see the variability.";
    const optimalDiv = document.getElementById("optimal");
    optimalDiv.innerHTML = statment;
}

/**
 * Builds a demographic statement that can be displayed in the UI describing 
 * the user that we are displaying intake suggestions for. Displays the
 * statement in the UI in the demographic information div.
 */
function buildDemoStatement(user) {
    let demoStatement = user.ageYears + " year old ";
    if (user.isMale) {
        demoStatement += "male ";
    } else {
        demoStatement += "female ";
    }
    demoStatement += " that is ";
    if (currentNumberSystem == NUM_SYSTEM_IMPERIAL) {
        let heightInInches = convertCentimetersToInches(user.heightCM);
        demoStatement += convertInchesToString(heightInInches);
    } else {
        demoStatement += user.heightCM + " cm";
    }
    demoStatement += ", weighs "
    if (currentNumberSystem == NUM_SYSTEM_IMPERIAL) {
        let weightInLbs = convertKgToLbs(user.weightKG);
        demoStatement += weightInLbs + " lb";
    } else {
        demoStatement += user.weightKG + " kg";
    }
    demoStatement += ", and is " + user.activityLevel.toLowerCase() + ". ";
    const isAthlete = (user.athleteType != null);
    if (isAthlete) {
        demoStatement += "Is a " + user.athleteType.toLowerCase() + " athlete and"
    } else {
        demoStatement += "Is not an athlete and"
    }
    const knowsFFM = (user.bodyFat != null);
    if (knowsFFM) {
        demoStatement += " has a body fat percentage of " + (user.bodyFat.measurement * 100) + "%."
    } else {
        demoStatement += " has an unknown body fat percentage.";
    }
    const demoDiv = document.getElementById("demographicInfo");
    demoDiv.innerHTML = demoStatement;
}

/**
 * Builds a bar chart that displays all of the equations listed in the 
 * TDEE equation list on the left hand side of the results page.
 * For each equation being considered, both the calculated RMR and 
 * TDEE are displayed.
 */
function buildChart(user, equationsToConsider) {
    const rmrDataset = {
        label: "RMR",
        data: equationsToConsider.map(equation => equation.getEstimateOfRMR(user)),
        borderColor: "#1D2671",
        backgroundColor: "#1D2671",
        hoverBackgroundColor: "#1D2671",
        hoverBorderColor: "#1D2671",
    };
    const tdeeDataset = {
        label: "TDEE",
        data: equationsToConsider.map(equation => equation.getEstimateOfTDEE(user)),
        borderColor: "#C33764",
        backgroundColor: "#C33764",
        hoverBackgroundColor: "#C33764",
        hoverBorderColor: "#C33764",

    };
    const ctx = document.getElementById('tdeeChart');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: equationsToConsider.map(equation => equation.name),
            datasets: [rmrDataset, tdeeDataset]
        }
    });
}

/**
 * Creates a div for each equation that the calculator considers in the UI
 * under the how it works section, where a high level explanation of the 
 * project is given.
 */
function buildEquationList() {
    const equationListDiv = document.getElementById("equationList");
    ALL_EQUATIONS.forEach(equation => {
        const isfatFreeMassEquation = FFM_EQUATION_LIST.includes(equation);
        const isBodyWeightEquation = BW_EQUATION_LIST.includes(equation);
        let fullName = equation.name;
        if (isfatFreeMassEquation) {
            fullName += " fat free mass ";
        }
        else if (isBodyWeightEquation) {
            fullName += " body weight ";
        }
        const equationNameDiv = document.createElement("div");
        equationNameDiv.innerHTML = fullName;
        equationNameDiv.classList.add("equationName");
        equationNameDiv.classList.add("lsThemeText");
        equationListDiv.append(equationNameDiv);
        equation.plainTextEquation.forEach(equationString => {
            const equationDefinitionDiv = document.createElement("div");
            equationDefinitionDiv.classList.add("equationDefinition")
            const equationStringDiv = document.createElement("div");
            equationStringDiv.classList.add("equationString");
            equationStringDiv.innerHTML = equationString;
            equationDefinitionDiv.append(equationStringDiv);
            equationListDiv.append(equationDefinitionDiv);
        });
    });
}

/**
 * Waits for DOM to load before calling any setup functions.
 */
document.addEventListener("DOMContentLoaded", resetForm);
