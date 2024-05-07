/* C. Elegans Connectome ported to Javascript
/* Based on the python GoPiGo Connectome by Timothy Busbice, Gabriel Garrett, Geoffrey Churchill
/* Find it here: https://github.com/Connectome/GoPiGo
/* Pls do not remove this header - zrispo
 */

var BRAIN = {};

/* Note: The way these work is sort of confusing
 * After every update, the value in nextState is copied into thisState,
 * and thisState and nextState are swapped (so after the first update, thisState = 1, and nextState = 0) */
BRAIN.thisState = 0;
BRAIN.nextState = 1;

/* Maximum accumulated value that must be exceeded before the Neurite will fire */
BRAIN.fireThreshold = 30;

/* Accumulators are used to decide the value to send to the Left and Right motors of the GoPiGo robot */
/* Since this is the javascript version, you can use these to control whatever you want! */
BRAIN.accumleft = 0;
BRAIN.accumright = 0;

/* Used to remove from Axon firing since muscles cannot fire. */
BRAIN.muscles = ["MVU", "MVL", "MDL", "MVR", "MDR"];

BRAIN.muscleList = [
  "MDL07",
  "MDL08",
  "MDL09",
  "MDL10",
  "MDL11",
  "MDL12",
  "MDL13",
  "MDL14",
  "MDL15",
  "MDL16",
  "MDL17",
  "MDL18",
  "MDL19",
  "MDL20",
  "MDL21",
  "MDL22",
  "MDL23",
  "MVL07",
  "MVL08",
  "MVL09",
  "MVL10",
  "MVL11",
  "MVL12",
  "MVL13",
  "MVL14",
  "MVL15",
  "MVL16",
  "MVL17",
  "MVL18",
  "MVL19",
  "MVL20",
  "MVL21",
  "MVL22",
  "MVL23",
  "MDR07",
  "MDR08",
  "MDR09",
  "MDR10",
  "MDR11",
  "MDR12",
  "MDR13",
  "MDR14",
  "MDR15",
  "MDR16",
  "MDR17",
  "MDR18",
  "MDR19",
  "MDR20",
  "MDL21",
  "MDR22",
  "MDR23",
  "MVR07",
  "MVR08",
  "MVR09",
  "MVR10",
  "MVR11",
  "MVR12",
  "MVR13",
  "MVR14",
  "MVR15",
  "MVR16",
  "MVR17",
  "MVR18",
  "MVR19",
  "MVR20",
  "MVL21",
  "MVR22",
  "MVR23",
];

BRAIN.mLeft = [
  "MDL07",
  "MDL08",
  "MDL09",
  "MDL10",
  "MDL11",
  "MDL12",
  "MDL13",
  "MDL14",
  "MDL15",
  "MDL16",
  "MDL17",
  "MDL18",
  "MDL19",
  "MDL20",
  "MDL21",
  "MDL22",
  "MDL23",
  "MVL07",
  "MVL08",
  "MVL09",
  "MVL10",
  "MVL11",
  "MVL12",
  "MVL13",
  "MVL14",
  "MVL15",
  "MVL16",
  "MVL17",
  "MVL18",
  "MVL19",
  "MVL20",
  "MVL21",
  "MVL22",
  "MVL23",
];
BRAIN.mRight = [
  "MDR07",
  "MDR08",
  "MDR09",
  "MDR10",
  "MDR11",
  "MDR12",
  "MDR13",
  "MDR14",
  "MDR15",
  "MDR16",
  "MDR17",
  "MDR18",
  "MDR19",
  "MDR20",
  "MDL21",
  "MDR22",
  "MDR23",
  "MVR07",
  "MVR08",
  "MVR09",
  "MVR10",
  "MVR11",
  "MVR12",
  "MVR13",
  "MVR14",
  "MVR15",
  "MVR16",
  "MVR17",
  "MVR18",
  "MVR19",
  "MVR20",
  "MVL21",
  "MVR22",
  "MVR23",
];
/* Used to accumulate muscle weighted values in body muscles 07-23 = worm locomotion */
BRAIN.musDleft = [
  "MDL07",
  "MDL08",
  "MDL09",
  "MDL10",
  "MDL11",
  "MDL12",
  "MDL13",
  "MDL14",
  "MDL15",
  "MDL16",
  "MDL17",
  "MDL18",
  "MDL19",
  "MDL20",
  "MDL21",
  "MDL22",
  "MDL23",
];
BRAIN.musVleft = [
  "MVL07",
  "MVL08",
  "MVL09",
  "MVL10",
  "MVL11",
  "MVL12",
  "MVL13",
  "MVL14",
  "MVL15",
  "MVL16",
  "MVL17",
  "MVL18",
  "MVL19",
  "MVL20",
  "MVL21",
  "MVL22",
  "MVL23",
];
BRAIN.musDright = [
  "MDR07",
  "MDR08",
  "MDR09",
  "MDR10",
  "MDR11",
  "MDR12",
  "MDR13",
  "MDR14",
  "MDR15",
  "MDR16",
  "MDR17",
  "MDR18",
  "MDR19",
  "MDR20",
  "MDL21",
  "MDR22",
  "MDR23",
];
BRAIN.musVright = [
  "MVR07",
  "MVR08",
  "MVR09",
  "MVR10",
  "MVR11",
  "MVR12",
  "MVR13",
  "MVR14",
  "MVR15",
  "MVR16",
  "MVR17",
  "MVR18",
  "MVR19",
  "MVR20",
  "MVL21",
  "MVR22",
  "MVR23",
];

/* Use these to stimulate nose and food sensing neurons */
BRAIN.stimulateHungerNeurons = true;
BRAIN.stimulateNoseTouchNeurons = false;
BRAIN.stimulateFoodSenseNeurons = false;

// we want each simualtion to be slightly different
BRAIN.randExcite = function () {
  for (var i = 0; i < 40; i++) {
    BRAIN.dendriteAccumulate(
      Object.keys(BRAIN.connectome)[
        Math.floor(Math.random() * Object.keys(BRAIN.connectome).length)
      ]
    );
  }
};

BRAIN.setup = function () {
  /* The postSynaptic dictionary contains the accumulated weighted values as the
   * connectome is executed */
  BRAIN.postSynaptic = {};

  /* This is the full C Elegans Connectome as expresed in the form of the connectome
   *  neurite and the postSynaptic neurites. */
  BRAIN.connectome = {};

  BRAIN.postSynaptic["ADAL"] = [0, 0];
  BRAIN.postSynaptic["ADAR"] = [0, 0];
  BRAIN.postSynaptic["ADEL"] = [0, 0];
  BRAIN.postSynaptic["ADER"] = [0, 0];
  BRAIN.postSynaptic["ADFL"] = [0, 0];
  BRAIN.postSynaptic["ADFR"] = [0, 0];
  BRAIN.postSynaptic["ADLL"] = [0, 0];
  BRAIN.postSynaptic["ADLR"] = [0, 0];
  BRAIN.postSynaptic["AFDL"] = [0, 0];
  BRAIN.postSynaptic["AFDR"] = [0, 0];
  BRAIN.postSynaptic["AIAL"] = [0, 0];
  BRAIN.postSynaptic["AIAR"] = [0, 0];
  BRAIN.postSynaptic["AIBL"] = [0, 0];
  BRAIN.postSynaptic["AIBR"] = [0, 0];
  BRAIN.postSynaptic["AIML"] = [0, 0];
  BRAIN.postSynaptic["AIMR"] = [0, 0];
  BRAIN.postSynaptic["AINL"] = [0, 0];
  BRAIN.postSynaptic["AINR"] = [0, 0];
  BRAIN.postSynaptic["AIYL"] = [0, 0];
  BRAIN.postSynaptic["AIYR"] = [0, 0];
  BRAIN.postSynaptic["AIZL"] = [0, 0];
  BRAIN.postSynaptic["AIZR"] = [0, 0];
  BRAIN.postSynaptic["ALA"] = [0, 0];
  BRAIN.postSynaptic["ALML"] = [0, 0];
  BRAIN.postSynaptic["ALMR"] = [0, 0];
  BRAIN.postSynaptic["ALNL"] = [0, 0];
  BRAIN.postSynaptic["ALNR"] = [0, 0];
  BRAIN.postSynaptic["AQR"] = [0, 0];
  BRAIN.postSynaptic["AS1"] = [0, 0];
  BRAIN.postSynaptic["AS10"] = [0, 0];
  BRAIN.postSynaptic["AS11"] = [0, 0];
  BRAIN.postSynaptic["AS2"] = [0, 0];
  BRAIN.postSynaptic["AS3"] = [0, 0];
  BRAIN.postSynaptic["AS4"] = [0, 0];
  BRAIN.postSynaptic["AS5"] = [0, 0];
  BRAIN.postSynaptic["AS6"] = [0, 0];
  BRAIN.postSynaptic["AS7"] = [0, 0];
  BRAIN.postSynaptic["AS8"] = [0, 0];
  BRAIN.postSynaptic["AS9"] = [0, 0];
  BRAIN.postSynaptic["ASEL"] = [0, 0];
  BRAIN.postSynaptic["ASER"] = [0, 0];
  BRAIN.postSynaptic["ASGL"] = [0, 0];
  BRAIN.postSynaptic["ASGR"] = [0, 0];
  BRAIN.postSynaptic["ASHL"] = [0, 0];
  BRAIN.postSynaptic["ASHR"] = [0, 0];
  BRAIN.postSynaptic["ASIL"] = [0, 0];
  BRAIN.postSynaptic["ASIR"] = [0, 0];
  BRAIN.postSynaptic["ASJL"] = [0, 0];
  BRAIN.postSynaptic["ASJR"] = [0, 0];
  BRAIN.postSynaptic["ASKL"] = [0, 0];
  BRAIN.postSynaptic["ASKR"] = [0, 0];
  BRAIN.postSynaptic["AUAL"] = [0, 0];
  BRAIN.postSynaptic["AUAR"] = [0, 0];
  BRAIN.postSynaptic["AVAL"] = [0, 0];
  BRAIN.postSynaptic["AVAR"] = [0, 0];
  BRAIN.postSynaptic["AVBL"] = [0, 0];
  BRAIN.postSynaptic["AVBR"] = [0, 0];
  BRAIN.postSynaptic["AVDL"] = [0, 0];
  BRAIN.postSynaptic["AVDR"] = [0, 0];
  BRAIN.postSynaptic["AVEL"] = [0, 0];
  BRAIN.postSynaptic["AVER"] = [0, 0];
  BRAIN.postSynaptic["AVFL"] = [0, 0];
  BRAIN.postSynaptic["AVFR"] = [0, 0];
  BRAIN.postSynaptic["AVG"] = [0, 0];
  BRAIN.postSynaptic["AVHL"] = [0, 0];
  BRAIN.postSynaptic["AVHR"] = [0, 0];
  BRAIN.postSynaptic["AVJL"] = [0, 0];
  BRAIN.postSynaptic["AVJR"] = [0, 0];
  BRAIN.postSynaptic["AVKL"] = [0, 0];
  BRAIN.postSynaptic["AVKR"] = [0, 0];
  BRAIN.postSynaptic["AVL"] = [0, 0];
  BRAIN.postSynaptic["AVM"] = [0, 0];
  BRAIN.postSynaptic["AWAL"] = [0, 0];
  BRAIN.postSynaptic["AWAR"] = [0, 0];
  BRAIN.postSynaptic["AWBL"] = [0, 0];
  BRAIN.postSynaptic["AWBR"] = [0, 0];
  BRAIN.postSynaptic["AWCL"] = [0, 0];
  BRAIN.postSynaptic["AWCR"] = [0, 0];
  BRAIN.postSynaptic["BAGL"] = [0, 0];
  BRAIN.postSynaptic["BAGR"] = [0, 0];
  BRAIN.postSynaptic["BDUL"] = [0, 0];
  BRAIN.postSynaptic["BDUR"] = [0, 0];
  BRAIN.postSynaptic["CEPDL"] = [0, 0];
  BRAIN.postSynaptic["CEPDR"] = [0, 0];
  BRAIN.postSynaptic["CEPVL"] = [0, 0];
  BRAIN.postSynaptic["CEPVR"] = [0, 0];
  BRAIN.postSynaptic["DA1"] = [0, 0];
  BRAIN.postSynaptic["DA2"] = [0, 0];
  BRAIN.postSynaptic["DA3"] = [0, 0];
  BRAIN.postSynaptic["DA4"] = [0, 0];
  BRAIN.postSynaptic["DA5"] = [0, 0];
  BRAIN.postSynaptic["DA6"] = [0, 0];
  BRAIN.postSynaptic["DA7"] = [0, 0];
  BRAIN.postSynaptic["DA8"] = [0, 0];
  BRAIN.postSynaptic["DA9"] = [0, 0];
  BRAIN.postSynaptic["DB1"] = [0, 0];
  BRAIN.postSynaptic["DB2"] = [0, 0];
  BRAIN.postSynaptic["DB3"] = [0, 0];
  BRAIN.postSynaptic["DB4"] = [0, 0];
  BRAIN.postSynaptic["DB5"] = [0, 0];
  BRAIN.postSynaptic["DB6"] = [0, 0];
  BRAIN.postSynaptic["DB7"] = [0, 0];
  BRAIN.postSynaptic["DD1"] = [0, 0];
  BRAIN.postSynaptic["DD2"] = [0, 0];
  BRAIN.postSynaptic["DD3"] = [0, 0];
  BRAIN.postSynaptic["DD4"] = [0, 0];
  BRAIN.postSynaptic["DD5"] = [0, 0];
  BRAIN.postSynaptic["DD6"] = [0, 0];
  BRAIN.postSynaptic["DVA"] = [0, 0];
  BRAIN.postSynaptic["DVB"] = [0, 0];
  BRAIN.postSynaptic["DVC"] = [0, 0];
  BRAIN.postSynaptic["FLPL"] = [0, 0];
  BRAIN.postSynaptic["FLPR"] = [0, 0];
  BRAIN.postSynaptic["HSNL"] = [0, 0];
  BRAIN.postSynaptic["HSNR"] = [0, 0];
  BRAIN.postSynaptic["I1L"] = [0, 0];
  BRAIN.postSynaptic["I1R"] = [0, 0];
  BRAIN.postSynaptic["I2L"] = [0, 0];
  BRAIN.postSynaptic["I2R"] = [0, 0];
  BRAIN.postSynaptic["I3"] = [0, 0];
  BRAIN.postSynaptic["I4"] = [0, 0];
  BRAIN.postSynaptic["I5"] = [0, 0];
  BRAIN.postSynaptic["I6"] = [0, 0];
  BRAIN.postSynaptic["IL1DL"] = [0, 0];
  BRAIN.postSynaptic["IL1DR"] = [0, 0];
  BRAIN.postSynaptic["IL1L"] = [0, 0];
  BRAIN.postSynaptic["IL1R"] = [0, 0];
  BRAIN.postSynaptic["IL1VL"] = [0, 0];
  BRAIN.postSynaptic["IL1VR"] = [0, 0];
  BRAIN.postSynaptic["IL2L"] = [0, 0];
  BRAIN.postSynaptic["IL2R"] = [0, 0];
  BRAIN.postSynaptic["IL2DL"] = [0, 0];
  BRAIN.postSynaptic["IL2DR"] = [0, 0];
  BRAIN.postSynaptic["IL2VL"] = [0, 0];
  BRAIN.postSynaptic["IL2VR"] = [0, 0];
  BRAIN.postSynaptic["LUAL"] = [0, 0];
  BRAIN.postSynaptic["LUAR"] = [0, 0];
  BRAIN.postSynaptic["M1"] = [0, 0];
  BRAIN.postSynaptic["M2L"] = [0, 0];
  BRAIN.postSynaptic["M2R"] = [0, 0];
  BRAIN.postSynaptic["M3L"] = [0, 0];
  BRAIN.postSynaptic["M3R"] = [0, 0];
  BRAIN.postSynaptic["M4"] = [0, 0];
  BRAIN.postSynaptic["M5"] = [0, 0];
  BRAIN.postSynaptic["MANAL"] = [0, 0];
  BRAIN.postSynaptic["MCL"] = [0, 0];
  BRAIN.postSynaptic["MCR"] = [0, 0];
  BRAIN.postSynaptic["MDL01"] = [0, 0];
  BRAIN.postSynaptic["MDL02"] = [0, 0];
  BRAIN.postSynaptic["MDL03"] = [0, 0];
  BRAIN.postSynaptic["MDL04"] = [0, 0];
  BRAIN.postSynaptic["MDL05"] = [0, 0];
  BRAIN.postSynaptic["MDL06"] = [0, 0];
  BRAIN.postSynaptic["MDL07"] = [0, 0];
  BRAIN.postSynaptic["MDL08"] = [0, 0];
  BRAIN.postSynaptic["MDL09"] = [0, 0];
  BRAIN.postSynaptic["MDL10"] = [0, 0];
  BRAIN.postSynaptic["MDL11"] = [0, 0];
  BRAIN.postSynaptic["MDL12"] = [0, 0];
  BRAIN.postSynaptic["MDL13"] = [0, 0];
  BRAIN.postSynaptic["MDL14"] = [0, 0];
  BRAIN.postSynaptic["MDL15"] = [0, 0];
  BRAIN.postSynaptic["MDL16"] = [0, 0];
  BRAIN.postSynaptic["MDL17"] = [0, 0];
  BRAIN.postSynaptic["MDL18"] = [0, 0];
  BRAIN.postSynaptic["MDL19"] = [0, 0];
  BRAIN.postSynaptic["MDL20"] = [0, 0];
  BRAIN.postSynaptic["MDL21"] = [0, 0];
  BRAIN.postSynaptic["MDL22"] = [0, 0];
  BRAIN.postSynaptic["MDL23"] = [0, 0];
  BRAIN.postSynaptic["MDL24"] = [0, 0];
  BRAIN.postSynaptic["MDR01"] = [0, 0];
  BRAIN.postSynaptic["MDR02"] = [0, 0];
  BRAIN.postSynaptic["MDR03"] = [0, 0];
  BRAIN.postSynaptic["MDR04"] = [0, 0];
  BRAIN.postSynaptic["MDR05"] = [0, 0];
  BRAIN.postSynaptic["MDR06"] = [0, 0];
  BRAIN.postSynaptic["MDR07"] = [0, 0];
  BRAIN.postSynaptic["MDR08"] = [0, 0];
  BRAIN.postSynaptic["MDR09"] = [0, 0];
  BRAIN.postSynaptic["MDR10"] = [0, 0];
  BRAIN.postSynaptic["MDR11"] = [0, 0];
  BRAIN.postSynaptic["MDR12"] = [0, 0];
  BRAIN.postSynaptic["MDR13"] = [0, 0];
  BRAIN.postSynaptic["MDR14"] = [0, 0];
  BRAIN.postSynaptic["MDR15"] = [0, 0];
  BRAIN.postSynaptic["MDR16"] = [0, 0];
  BRAIN.postSynaptic["MDR17"] = [0, 0];
  BRAIN.postSynaptic["MDR18"] = [0, 0];
  BRAIN.postSynaptic["MDR19"] = [0, 0];
  BRAIN.postSynaptic["MDR20"] = [0, 0];
  BRAIN.postSynaptic["MDR21"] = [0, 0];
  BRAIN.postSynaptic["MDR22"] = [0, 0];
  BRAIN.postSynaptic["MDR23"] = [0, 0];
  BRAIN.postSynaptic["MDR24"] = [0, 0];
  BRAIN.postSynaptic["MI"] = [0, 0];
  BRAIN.postSynaptic["MVL01"] = [0, 0];
  BRAIN.postSynaptic["MVL02"] = [0, 0];
  BRAIN.postSynaptic["MVL03"] = [0, 0];
  BRAIN.postSynaptic["MVL04"] = [0, 0];
  BRAIN.postSynaptic["MVL05"] = [0, 0];
  BRAIN.postSynaptic["MVL06"] = [0, 0];
  BRAIN.postSynaptic["MVL07"] = [0, 0];
  BRAIN.postSynaptic["MVL08"] = [0, 0];
  BRAIN.postSynaptic["MVL09"] = [0, 0];
  BRAIN.postSynaptic["MVL10"] = [0, 0];
  BRAIN.postSynaptic["MVL11"] = [0, 0];
  BRAIN.postSynaptic["MVL12"] = [0, 0];
  BRAIN.postSynaptic["MVL13"] = [0, 0];
  BRAIN.postSynaptic["MVL14"] = [0, 0];
  BRAIN.postSynaptic["MVL15"] = [0, 0];
  BRAIN.postSynaptic["MVL16"] = [0, 0];
  BRAIN.postSynaptic["MVL17"] = [0, 0];
  BRAIN.postSynaptic["MVL18"] = [0, 0];
  BRAIN.postSynaptic["MVL19"] = [0, 0];
  BRAIN.postSynaptic["MVL20"] = [0, 0];
  BRAIN.postSynaptic["MVL21"] = [0, 0];
  BRAIN.postSynaptic["MVL22"] = [0, 0];
  BRAIN.postSynaptic["MVL23"] = [0, 0];
  BRAIN.postSynaptic["MVR01"] = [0, 0];
  BRAIN.postSynaptic["MVR02"] = [0, 0];
  BRAIN.postSynaptic["MVR03"] = [0, 0];
  BRAIN.postSynaptic["MVR04"] = [0, 0];
  BRAIN.postSynaptic["MVR05"] = [0, 0];
  BRAIN.postSynaptic["MVR06"] = [0, 0];
  BRAIN.postSynaptic["MVR07"] = [0, 0];
  BRAIN.postSynaptic["MVR08"] = [0, 0];
  BRAIN.postSynaptic["MVR09"] = [0, 0];
  BRAIN.postSynaptic["MVR10"] = [0, 0];
  BRAIN.postSynaptic["MVR11"] = [0, 0];
  BRAIN.postSynaptic["MVR12"] = [0, 0];
  BRAIN.postSynaptic["MVR13"] = [0, 0];
  BRAIN.postSynaptic["MVR14"] = [0, 0];
  BRAIN.postSynaptic["MVR15"] = [0, 0];
  BRAIN.postSynaptic["MVR16"] = [0, 0];
  BRAIN.postSynaptic["MVR17"] = [0, 0];
  BRAIN.postSynaptic["MVR18"] = [0, 0];
  BRAIN.postSynaptic["MVR19"] = [0, 0];
  BRAIN.postSynaptic["MVR20"] = [0, 0];
  BRAIN.postSynaptic["MVR21"] = [0, 0];
  BRAIN.postSynaptic["MVR22"] = [0, 0];
  BRAIN.postSynaptic["MVR23"] = [0, 0];
  BRAIN.postSynaptic["MVR24"] = [0, 0];
  BRAIN.postSynaptic["MVULVA"] = [0, 0];
  BRAIN.postSynaptic["NSML"] = [0, 0];
  BRAIN.postSynaptic["NSMR"] = [0, 0];
  BRAIN.postSynaptic["OLLL"] = [0, 0];
  BRAIN.postSynaptic["OLLR"] = [0, 0];
  BRAIN.postSynaptic["OLQDL"] = [0, 0];
  BRAIN.postSynaptic["OLQDR"] = [0, 0];
  BRAIN.postSynaptic["OLQVL"] = [0, 0];
  BRAIN.postSynaptic["OLQVR"] = [0, 0];
  BRAIN.postSynaptic["PDA"] = [0, 0];
  BRAIN.postSynaptic["PDB"] = [0, 0];
  BRAIN.postSynaptic["PDEL"] = [0, 0];
  BRAIN.postSynaptic["PDER"] = [0, 0];
  BRAIN.postSynaptic["PHAL"] = [0, 0];
  BRAIN.postSynaptic["PHAR"] = [0, 0];
  BRAIN.postSynaptic["PHBL"] = [0, 0];
  BRAIN.postSynaptic["PHBR"] = [0, 0];
  BRAIN.postSynaptic["PHCL"] = [0, 0];
  BRAIN.postSynaptic["PHCR"] = [0, 0];
  BRAIN.postSynaptic["PLML"] = [0, 0];
  BRAIN.postSynaptic["PLMR"] = [0, 0];
  BRAIN.postSynaptic["PLNL"] = [0, 0];
  BRAIN.postSynaptic["PLNR"] = [0, 0];
  BRAIN.postSynaptic["PQR"] = [0, 0];
  BRAIN.postSynaptic["PVCL"] = [0, 0];
  BRAIN.postSynaptic["PVCR"] = [0, 0];
  BRAIN.postSynaptic["PVDL"] = [0, 0];
  BRAIN.postSynaptic["PVDR"] = [0, 0];
  BRAIN.postSynaptic["PVM"] = [0, 0];
  BRAIN.postSynaptic["PVNL"] = [0, 0];
  BRAIN.postSynaptic["PVNR"] = [0, 0];
  BRAIN.postSynaptic["PVPL"] = [0, 0];
  BRAIN.postSynaptic["PVPR"] = [0, 0];
  BRAIN.postSynaptic["PVQL"] = [0, 0];
  BRAIN.postSynaptic["PVQR"] = [0, 0];
  BRAIN.postSynaptic["PVR"] = [0, 0];
  BRAIN.postSynaptic["PVT"] = [0, 0];
  BRAIN.postSynaptic["PVWL"] = [0, 0];
  BRAIN.postSynaptic["PVWR"] = [0, 0];
  BRAIN.postSynaptic["RIAL"] = [0, 0];
  BRAIN.postSynaptic["RIAR"] = [0, 0];
  BRAIN.postSynaptic["RIBL"] = [0, 0];
  BRAIN.postSynaptic["RIBR"] = [0, 0];
  BRAIN.postSynaptic["RICL"] = [0, 0];
  BRAIN.postSynaptic["RICR"] = [0, 0];
  BRAIN.postSynaptic["RID"] = [0, 0];
  BRAIN.postSynaptic["RIFL"] = [0, 0];
  BRAIN.postSynaptic["RIFR"] = [0, 0];
  BRAIN.postSynaptic["RIGL"] = [0, 0];
  BRAIN.postSynaptic["RIGR"] = [0, 0];
  BRAIN.postSynaptic["RIH"] = [0, 0];
  BRAIN.postSynaptic["RIML"] = [0, 0];
  BRAIN.postSynaptic["RIMR"] = [0, 0];
  BRAIN.postSynaptic["RIPL"] = [0, 0];
  BRAIN.postSynaptic["RIPR"] = [0, 0];
  BRAIN.postSynaptic["RIR"] = [0, 0];
  BRAIN.postSynaptic["RIS"] = [0, 0];
  BRAIN.postSynaptic["RIVL"] = [0, 0];
  BRAIN.postSynaptic["RIVR"] = [0, 0];
  BRAIN.postSynaptic["RMDDL"] = [0, 0];
  BRAIN.postSynaptic["RMDDR"] = [0, 0];
  BRAIN.postSynaptic["RMDL"] = [0, 0];
  BRAIN.postSynaptic["RMDR"] = [0, 0];
  BRAIN.postSynaptic["RMDVL"] = [0, 0];
  BRAIN.postSynaptic["RMDVR"] = [0, 0];
  BRAIN.postSynaptic["RMED"] = [0, 0];
  BRAIN.postSynaptic["RMEL"] = [0, 0];
  BRAIN.postSynaptic["RMER"] = [0, 0];
  BRAIN.postSynaptic["RMEV"] = [0, 0];
  BRAIN.postSynaptic["RMFL"] = [0, 0];
  BRAIN.postSynaptic["RMFR"] = [0, 0];
  BRAIN.postSynaptic["RMGL"] = [0, 0];
  BRAIN.postSynaptic["RMGR"] = [0, 0];
  BRAIN.postSynaptic["RMHL"] = [0, 0];
  BRAIN.postSynaptic["RMHR"] = [0, 0];
  BRAIN.postSynaptic["SAADL"] = [0, 0];
  BRAIN.postSynaptic["SAADR"] = [0, 0];
  BRAIN.postSynaptic["SAAVL"] = [0, 0];
  BRAIN.postSynaptic["SAAVR"] = [0, 0];
  BRAIN.postSynaptic["SABD"] = [0, 0];
  BRAIN.postSynaptic["SABVL"] = [0, 0];
  BRAIN.postSynaptic["SABVR"] = [0, 0];
  BRAIN.postSynaptic["SDQL"] = [0, 0];
  BRAIN.postSynaptic["SDQR"] = [0, 0];
  BRAIN.postSynaptic["SIADL"] = [0, 0];
  BRAIN.postSynaptic["SIADR"] = [0, 0];
  BRAIN.postSynaptic["SIAVL"] = [0, 0];
  BRAIN.postSynaptic["SIAVR"] = [0, 0];
  BRAIN.postSynaptic["SIBDL"] = [0, 0];
  BRAIN.postSynaptic["SIBDR"] = [0, 0];
  BRAIN.postSynaptic["SIBVL"] = [0, 0];
  BRAIN.postSynaptic["SIBVR"] = [0, 0];
  BRAIN.postSynaptic["SMBDL"] = [0, 0];
  BRAIN.postSynaptic["SMBDR"] = [0, 0];
  BRAIN.postSynaptic["SMBVL"] = [0, 0];
  BRAIN.postSynaptic["SMBVR"] = [0, 0];
  BRAIN.postSynaptic["SMDDL"] = [0, 0];
  BRAIN.postSynaptic["SMDDR"] = [0, 0];
  BRAIN.postSynaptic["SMDVL"] = [0, 0];
  BRAIN.postSynaptic["SMDVR"] = [0, 0];
  BRAIN.postSynaptic["URADL"] = [0, 0];
  BRAIN.postSynaptic["URADR"] = [0, 0];
  BRAIN.postSynaptic["URAVL"] = [0, 0];
  BRAIN.postSynaptic["URAVR"] = [0, 0];
  BRAIN.postSynaptic["URBL"] = [0, 0];
  BRAIN.postSynaptic["URBR"] = [0, 0];
  BRAIN.postSynaptic["URXL"] = [0, 0];
  BRAIN.postSynaptic["URXR"] = [0, 0];
  BRAIN.postSynaptic["URYDL"] = [0, 0];
  BRAIN.postSynaptic["URYDR"] = [0, 0];
  BRAIN.postSynaptic["URYVL"] = [0, 0];
  BRAIN.postSynaptic["URYVR"] = [0, 0];
  BRAIN.postSynaptic["VA1"] = [0, 0];
  BRAIN.postSynaptic["VA10"] = [0, 0];
  BRAIN.postSynaptic["VA11"] = [0, 0];
  BRAIN.postSynaptic["VA12"] = [0, 0];
  BRAIN.postSynaptic["VA2"] = [0, 0];
  BRAIN.postSynaptic["VA3"] = [0, 0];
  BRAIN.postSynaptic["VA4"] = [0, 0];
  BRAIN.postSynaptic["VA5"] = [0, 0];
  BRAIN.postSynaptic["VA6"] = [0, 0];
  BRAIN.postSynaptic["VA7"] = [0, 0];
  BRAIN.postSynaptic["VA8"] = [0, 0];
  BRAIN.postSynaptic["VA9"] = [0, 0];
  BRAIN.postSynaptic["VB1"] = [0, 0];
  BRAIN.postSynaptic["VB10"] = [0, 0];
  BRAIN.postSynaptic["VB11"] = [0, 0];
  BRAIN.postSynaptic["VB2"] = [0, 0];
  BRAIN.postSynaptic["VB3"] = [0, 0];
  BRAIN.postSynaptic["VB4"] = [0, 0];
  BRAIN.postSynaptic["VB5"] = [0, 0];
  BRAIN.postSynaptic["VB6"] = [0, 0];
  BRAIN.postSynaptic["VB7"] = [0, 0];
  BRAIN.postSynaptic["VB8"] = [0, 0];
  BRAIN.postSynaptic["VB9"] = [0, 0];
  BRAIN.postSynaptic["VC1"] = [0, 0];
  BRAIN.postSynaptic["VC2"] = [0, 0];
  BRAIN.postSynaptic["VC3"] = [0, 0];
  BRAIN.postSynaptic["VC4"] = [0, 0];
  BRAIN.postSynaptic["VC5"] = [0, 0];
  BRAIN.postSynaptic["VC6"] = [0, 0];
  BRAIN.postSynaptic["VD1"] = [0, 0];
  BRAIN.postSynaptic["VD10"] = [0, 0];
  BRAIN.postSynaptic["VD11"] = [0, 0];
  BRAIN.postSynaptic["VD12"] = [0, 0];
  BRAIN.postSynaptic["VD13"] = [0, 0];
  BRAIN.postSynaptic["VD2"] = [0, 0];
  BRAIN.postSynaptic["VD3"] = [0, 0];
  BRAIN.postSynaptic["VD4"] = [0, 0];
  BRAIN.postSynaptic["VD5"] = [0, 0];
  BRAIN.postSynaptic["VD6"] = [0, 0];
  BRAIN.postSynaptic["VD7"] = [0, 0];
  BRAIN.postSynaptic["VD8"] = [0, 0];
  BRAIN.postSynaptic["VD9"] = [0, 0];

  BRAIN.connectome["ADAL"] = function () {
    BRAIN.postSynaptic["ADAR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["ADFL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AIBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AIBR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["ASHL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["AVDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVDR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVEL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVJR"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["FLPR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVQL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RICL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RICR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIML"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RIPL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SMDVR"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["ADAR"] = function () {
    BRAIN.postSynaptic["ADAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ADFR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AIBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AIBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ASHR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["AVDL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVEL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVJL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["PVQR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RICL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIMR"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["RIPR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIVR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SMDVL"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["ADEL"] = function () {
    BRAIN.postSynaptic["ADAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ADER"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AINL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AVEL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVKR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["BDUL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["CEPDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["FLPL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["IL1L"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["IL2L"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDL05"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["OLLL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIFL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIGL"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["RIGR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RIH"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RIVL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIVR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RMGL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMHL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SIADR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SIBDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SMBDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["URBL"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["ADER"] = function () {
    BRAIN.postSynaptic["ADAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ADEL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["ALA"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVDR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVER"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVJR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVKL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVKR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["CEPDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["FLPL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["FLPR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["OLLR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["PVR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIGL"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["RIGR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["RIH"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["SAAVR"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["ADFL"] = function () {
    BRAIN.postSynaptic["ADAL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AIZL"][BRAIN.nextState] += 12;
    BRAIN.postSynaptic["AUAL"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["OLQVL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIAL"][BRAIN.nextState] += 15;
    BRAIN.postSynaptic["RIGL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["SMBVL"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["ADFR"] = function () {
    BRAIN.postSynaptic["ADAR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AIAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AIYR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AIZR"][BRAIN.nextState] += 8;
    BRAIN.postSynaptic["ASHR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AUAR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["AWBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVPR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIAR"][BRAIN.nextState] += 16;
    BRAIN.postSynaptic["RIGR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RIR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["SMBDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SMBVR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["URXR"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["ADLL"] = function () {
    BRAIN.postSynaptic["ADLR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AIAL"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["AIBL"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["AIBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ALA"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["ASER"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["ASHL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVDR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["AVDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVJL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVJR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AWBL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["OLQVL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RIPL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMGL"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["ADLR"] = function () {
    BRAIN.postSynaptic["ADLL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AIAR"][BRAIN.nextState] += 10;
    BRAIN.postSynaptic["AIBR"][BRAIN.nextState] += 10;
    BRAIN.postSynaptic["ASER"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ASHR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVDL"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["AVDR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVJR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AWCR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["OLLR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVCL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RICL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RICR"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["AFDL"] = function () {
    BRAIN.postSynaptic["AFDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AIBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AINR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AIYL"][BRAIN.nextState] += 7;
  };
  BRAIN.connectome["AFDR"] = function () {
    BRAIN.postSynaptic["AFDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AIBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AIYR"][BRAIN.nextState] += 13;
    BRAIN.postSynaptic["ASER"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["AIAL"] = function () {
    BRAIN.postSynaptic["ADAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AIAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AIBL"][BRAIN.nextState] += 10;
    BRAIN.postSynaptic["AIML"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AIZL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ASER"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["ASGL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ASHL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ASIL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["ASKL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AWAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AWCR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["HSNL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIFL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMGL"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["AIAR"] = function () {
    BRAIN.postSynaptic["ADAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ADFR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ADLR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AIAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AIBR"][BRAIN.nextState] += 14;
    BRAIN.postSynaptic["AIZR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ASER"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ASGR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ASIR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AWAR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AWCL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AWCR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RIFR"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["AIBL"] = function () {
    BRAIN.postSynaptic["AFDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AIYL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ASER"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["DVC"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["FLPL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVT"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIBR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["RIFL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIGR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIGR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RIML"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RIMR"][BRAIN.nextState] += 13;
    BRAIN.postSynaptic["RIMR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIVL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SAADL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["SAADR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["SMDDR"][BRAIN.nextState] += 4;
  };
  BRAIN.connectome["AIBR"] = function () {
    BRAIN.postSynaptic["AFDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AVEL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DB1"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DVC"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["PVT"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIBL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["RIGL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RIML"][BRAIN.nextState] += 16;
    BRAIN.postSynaptic["RIML"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIMR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIS"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIVR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SAADL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SMDDL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["SMDVL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VB1"][BRAIN.nextState] += 3;
  };
  BRAIN.connectome["AIML"] = function () {
    BRAIN.postSynaptic["AIAL"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["ALML"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ASGL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["ASKL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVER"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVFL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["AVFR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVHL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVHR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVJL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVQL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIFL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SIBDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SMBVL"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["AIMR"] = function () {
    BRAIN.postSynaptic["AIAR"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["ASGR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["ASJR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["ASKR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AVDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVFL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVFR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["HSNL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["HSNR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["OLQDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVNR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIFR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMGR"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["AINL"] = function () {
    BRAIN.postSynaptic["ADEL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AFDR"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["AINR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["ASEL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["ASGR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AUAR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["BAGL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RIBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIBR"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["AINR"] = function () {
    BRAIN.postSynaptic["AFDL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["AFDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AIAL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AIBL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AINL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["ASEL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ASER"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ASGL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AUAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AUAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["BAGR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RIBL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RID"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["AIYL"] = function () {
    BRAIN.postSynaptic["AIYR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AIZL"][BRAIN.nextState] += 13;
    BRAIN.postSynaptic["AWAL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AWCL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AWCR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["HSNR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIAL"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["RIBL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["RIML"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["AIYR"] = function () {
    BRAIN.postSynaptic["ADFR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AIYL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AIZR"][BRAIN.nextState] += 8;
    BRAIN.postSynaptic["AWAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["HSNL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIAR"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["RIBR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RIMR"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["AIZL"] = function () {
    BRAIN.postSynaptic["AIAL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AIBL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AIBR"][BRAIN.nextState] += 8;
    BRAIN.postSynaptic["AIZR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["ASEL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ASGL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ASHL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVER"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["DVA"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIAL"][BRAIN.nextState] += 8;
    BRAIN.postSynaptic["RIGL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIML"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["SMBDL"][BRAIN.nextState] += 9;
    BRAIN.postSynaptic["SMBVL"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["VB2"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["AIZR"] = function () {
    BRAIN.postSynaptic["AIAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AIBL"][BRAIN.nextState] += 8;
    BRAIN.postSynaptic["AIBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AIZL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["ASGR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ASHR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVEL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["AVER"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AWAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DVA"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIAR"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["RIMR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["SMBDR"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["SMBVR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["SMDDR"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["ALA"] = function () {
    BRAIN.postSynaptic["ADEL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVEL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVER"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RID"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDR"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["ALML"] = function () {
    BRAIN.postSynaptic["AVDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVEL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVM"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["BDUL"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["CEPDL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["CEPVL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["PVCL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["PVCR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMGL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SDQL"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["ALMR"] = function () {
    BRAIN.postSynaptic["AVM"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["BDUR"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["CEPDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["CEPVR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVCR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RMDDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SIADL"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["ALNL"] = function () {
    BRAIN.postSynaptic["SAAVL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["SMBDR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["SMBDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SMDVL"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["ALNR"] = function () {
    BRAIN.postSynaptic["ADER"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMHR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SAAVR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["SMBDL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["SMDDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SMDVL"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["AQR"] = function () {
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["AVDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVJL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVKL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVKR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["BAGL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["BAGR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["PVCR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["PVPL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVPL"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["PVPR"][BRAIN.nextState] += 9;
    BRAIN.postSynaptic["RIAL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RIAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIGL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RIGR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["URXL"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["AS1"] = function () {
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["DA1"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDL05"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["MDL08"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["MDR05"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["MDR08"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["VA3"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD1"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["VD2"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["AS2"] = function () {
    BRAIN.postSynaptic["DA2"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DB1"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DD1"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDL07"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["MDL08"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDR07"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["MDR08"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["VA4"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VD2"][BRAIN.nextState] += 10;
  };
  BRAIN.connectome["AS3"] = function () {
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DA2"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DA3"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DD1"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDL09"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["MDL10"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["MDR09"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["MDR10"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["VA5"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VD2"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD3"][BRAIN.nextState] += 15;
  };
  BRAIN.connectome["AS4"] = function () {
    BRAIN.postSynaptic["AS5"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DA3"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDL11"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDL12"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDR11"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["MDR12"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VD4"][BRAIN.nextState] += 11;
  };
  BRAIN.connectome["AS5"] = function () {
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DD2"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDL11"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDL14"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["MDR11"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDR14"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["VA7"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD5"][BRAIN.nextState] += 9;
  };
  BRAIN.connectome["AS6"] = function () {
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DA5"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDL13"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["MDL14"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDR13"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["MDR14"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VA8"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD6"][BRAIN.nextState] += 13;
  };
  BRAIN.connectome["AS7"] = function () {
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDL13"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDL16"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["MDR13"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDR16"][BRAIN.nextState] += 3;
  };
  BRAIN.connectome["AS8"] = function () {
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["MDL15"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDL18"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["MDR15"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDR18"][BRAIN.nextState] += 3;
  };
  BRAIN.connectome["AS9"] = function () {
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["DVB"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["MDL17"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDL20"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["MDR17"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDR20"][BRAIN.nextState] += 3;
  };
  BRAIN.connectome["AS10"] = function () {
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDL19"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["MDL20"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDR19"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["MDR20"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["AS11"] = function () {
    BRAIN.postSynaptic["MDL21"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDL22"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDL23"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDL24"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDR21"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDR22"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDR23"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDR24"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PDA"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PDB"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PDB"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VD13"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["ASEL"] = function () {
    BRAIN.postSynaptic["ADFR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AIAL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AIBL"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["AIBR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AIYL"][BRAIN.nextState] += 13;
    BRAIN.postSynaptic["AIYR"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["AWCL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["AWCR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIAR"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["ASER"] = function () {
    BRAIN.postSynaptic["AFDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AFDR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AIAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AIAR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AIBL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AIBR"][BRAIN.nextState] += 10;
    BRAIN.postSynaptic["AIYL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AIYR"][BRAIN.nextState] += 14;
    BRAIN.postSynaptic["AWAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AWCL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AWCR"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["ASGL"] = function () {
    BRAIN.postSynaptic["AIAL"][BRAIN.nextState] += 9;
    BRAIN.postSynaptic["AIBL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AINR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AIZL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ASKL"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["ASGR"] = function () {
    BRAIN.postSynaptic["AIAR"][BRAIN.nextState] += 10;
    BRAIN.postSynaptic["AIBR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AINL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AIYR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AIZR"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["ASHL"] = function () {
    BRAIN.postSynaptic["ADAL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["ADFL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AIAL"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["AIBL"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["AIZL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ASHR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ASKL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["AVDL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVDR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RIAL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["RICL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RIML"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIPL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMGL"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["ASHR"] = function () {
    BRAIN.postSynaptic["ADAR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["ADFR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AIAR"][BRAIN.nextState] += 10;
    BRAIN.postSynaptic["AIBR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AIZR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ASHL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ASKR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AVDL"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["AVDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVER"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["HSNR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVPR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIAR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RICR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RMGR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RMGR"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["ASIL"] = function () {
    BRAIN.postSynaptic["AIAL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AIBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AIYL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AIZL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ASER"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ASIR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ASKL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AWCL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AWCR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIBL"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["ASIR"] = function () {
    BRAIN.postSynaptic["AIAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AIAR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AIAR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AIBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ASEL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["ASHR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ASIL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AWCL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AWCR"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["ASJL"] = function () {
    BRAIN.postSynaptic["ASJR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ASKL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["HSNL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["HSNR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVQL"][BRAIN.nextState] += 14;
  };
  BRAIN.connectome["ASJR"] = function () {
    BRAIN.postSynaptic["ASJL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ASKR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["HSNR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVQR"][BRAIN.nextState] += 13;
  };
  BRAIN.connectome["ASKL"] = function () {
    BRAIN.postSynaptic["AIAL"][BRAIN.nextState] += 11;
    BRAIN.postSynaptic["AIBL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AIML"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["ASKR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVQL"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["RMGL"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["ASKR"] = function () {
    BRAIN.postSynaptic["AIAR"][BRAIN.nextState] += 11;
    BRAIN.postSynaptic["AIMR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ASHR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ASKL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AWAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["CEPVR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVQR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["RIFR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMGR"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["AUAL"] = function () {
    BRAIN.postSynaptic["AINR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AUAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AVDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVEL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AWBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIAL"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["RIBL"][BRAIN.nextState] += 9;
  };
  BRAIN.connectome["AUAR"] = function () {
    BRAIN.postSynaptic["AINL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AIYR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AUAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVER"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["AWBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIAR"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["RIBR"][BRAIN.nextState] += 13;
    BRAIN.postSynaptic["URXR"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["AVAL"] = function () {
    BRAIN.postSynaptic["AS1"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AS10"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AS11"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["AS2"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AS3"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AS4"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AS5"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["AS6"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AS7"][BRAIN.nextState] += 14;
    BRAIN.postSynaptic["AS8"][BRAIN.nextState] += 9;
    BRAIN.postSynaptic["AS9"][BRAIN.nextState] += 12;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVHL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVJL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["DA1"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["DA2"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["DA3"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["DA4"][BRAIN.nextState] += 10;
    BRAIN.postSynaptic["DA5"][BRAIN.nextState] += 8;
    BRAIN.postSynaptic["DA6"][BRAIN.nextState] += 21;
    BRAIN.postSynaptic["DA7"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["DA8"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["DA9"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["DB5"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["DB6"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["FLPL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["LUAL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["PVCL"][BRAIN.nextState] += 12;
    BRAIN.postSynaptic["PVCR"][BRAIN.nextState] += 11;
    BRAIN.postSynaptic["PVPL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIMR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["SABD"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["SABVR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SDQR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["URYDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["URYVR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VA1"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["VA10"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["VA11"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["VA12"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VA2"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["VA3"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["VA4"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["VA5"][BRAIN.nextState] += 8;
    BRAIN.postSynaptic["VA6"][BRAIN.nextState] += 10;
    BRAIN.postSynaptic["VA7"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VA8"][BRAIN.nextState] += 19;
    BRAIN.postSynaptic["VA9"][BRAIN.nextState] += 8;
    BRAIN.postSynaptic["VB9"][BRAIN.nextState] += 5;
  };
  BRAIN.connectome["AVAR"] = function () {
    BRAIN.postSynaptic["ADER"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AS1"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AS10"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AS11"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["AS2"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AS3"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AS4"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AS5"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AS6"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AS7"][BRAIN.nextState] += 8;
    BRAIN.postSynaptic["AS8"][BRAIN.nextState] += 9;
    BRAIN.postSynaptic["AS9"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVDR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVEL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVER"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["DA1"][BRAIN.nextState] += 8;
    BRAIN.postSynaptic["DA2"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["DA3"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["DA4"][BRAIN.nextState] += 8;
    BRAIN.postSynaptic["DA5"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["DA6"][BRAIN.nextState] += 13;
    BRAIN.postSynaptic["DA7"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["DA8"][BRAIN.nextState] += 9;
    BRAIN.postSynaptic["DA9"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["DB3"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DB5"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["DB6"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["LUAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["LUAR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["PDEL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PDER"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVCL"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["PVCR"][BRAIN.nextState] += 8;
    BRAIN.postSynaptic["RIGL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIML"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RIMR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SABD"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SABVL"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["SABVR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["URYDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["URYVL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VA10"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["VA11"][BRAIN.nextState] += 15;
    BRAIN.postSynaptic["VA12"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VA2"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VA3"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["VA4"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["VA5"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["VA6"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["VA7"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["VA8"][BRAIN.nextState] += 16;
    BRAIN.postSynaptic["VB9"][BRAIN.nextState] += 10;
    BRAIN.postSynaptic["VD13"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["AVBL"] = function () {
    BRAIN.postSynaptic["AQR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AS10"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AS3"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AS4"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AS5"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AS6"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AS7"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AS9"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["AVDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVDR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVEL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVER"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DB3"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DB4"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DB5"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DB6"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["DB7"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["DVA"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVNR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RID"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SDQR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SIBVL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VA10"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VA2"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VA7"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VB1"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VB10"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VB11"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VB2"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["VB4"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VB5"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VB6"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VB7"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VB8"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["VB9"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VC3"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["AVBR"] = function () {
    BRAIN.postSynaptic["AS1"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AS10"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AS3"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AS4"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AS5"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AS6"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AS7"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["DA5"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DB1"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["DB2"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DB3"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DB4"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DB5"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DB6"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DB7"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DD1"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DVA"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["HSNR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVNL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RIBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RID"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["SIBVL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VA4"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VA8"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VA9"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VB10"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VB11"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VB2"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VB3"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VB4"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VB6"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VB7"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VB8"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["VB9"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["VD10"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD3"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["AVDL"] = function () {
    BRAIN.postSynaptic["ADAR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AS1"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AS10"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AS11"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AS4"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AS5"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 13;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 19;
    BRAIN.postSynaptic["AVM"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["DA1"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DA2"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DA3"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["DA4"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DA5"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DA8"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["FLPL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["FLPR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["LUAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVCL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SABD"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SABVL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SABVR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VA5"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["AVDR"] = function () {
    BRAIN.postSynaptic["ADAL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["ADLL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AS10"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AS5"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 16;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 15;
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVDL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVJL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["DA1"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["DA2"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DA3"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DA4"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DA5"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["DA8"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DA9"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DB4"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DVC"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["FLPR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["LUAL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["PQR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SABD"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SABVL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["SABVR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VA11"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VA2"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VA3"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VA6"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["AVEL"] = function () {
    BRAIN.postSynaptic["AS1"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 12;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["AVER"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DA1"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["DA2"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DA3"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["DA4"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVCR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVT"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIML"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RIMR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RMDVR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMEV"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SABD"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["SABVL"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["SABVR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["VA1"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["VA3"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["VD2"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD3"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["AVER"] = function () {
    BRAIN.postSynaptic["AS1"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AS2"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AS3"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 16;
    BRAIN.postSynaptic["AVDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVEL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DA1"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["DA2"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["DA3"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DB3"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIML"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RIMR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RMDVL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDVR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMEV"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SABD"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["SABVL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["SABVR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["VA1"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VA2"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VA3"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VA4"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VA5"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["AVFL"] = function () {
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVFR"][BRAIN.nextState] += 30;
    BRAIN.postSynaptic["AVG"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVHL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["AVHR"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["AVJL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVJR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["HSNL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVL11"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVL12"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PDER"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVNL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["PVQL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVQR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VB1"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["AVFR"] = function () {
    BRAIN.postSynaptic["ASJL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ASKL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["AVFL"][BRAIN.nextState] += 24;
    BRAIN.postSynaptic["AVHL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["AVHR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVJL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVJR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["HSNR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVL14"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MVR14"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["PVQL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VC4"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD11"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["AVG"] = function () {
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVEL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVER"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVFL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVJL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DA8"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PHAL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["PVCL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVNR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVPR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVQR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVT"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIFL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIFR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VA11"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["AVHL"] = function () {
    BRAIN.postSynaptic["ADFR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVFL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVFL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVFR"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["AVHR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVJL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AWBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PHBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVPR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["PVQL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVQR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RIMR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["SMBDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SMBVR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD1"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["AVHR"] = function () {
    BRAIN.postSynaptic["ADLL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ADLR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AQR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVFL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVFR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVHL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVJR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["PVNL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVPL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RIGL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["SMBDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SMBVL"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["AVJL"] = function () {
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["AVDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVDR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVEL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVFR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVHL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVJR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["HSNR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PLMR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["PVCL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["PVCR"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["PVNR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIFR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIS"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["AVJR"] = function () {
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVDR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AVER"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AVJL"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["PVCL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["PVCR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["PVQR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SABVL"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["AVKL"] = function () {
    BRAIN.postSynaptic["ADER"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AQR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVEL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVER"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVKR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVM"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DVA"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PDEL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["PDER"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVM"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVPL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVPR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVT"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RICL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RICR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIGL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIML"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RIMR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMFR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SAADR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SIAVR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SMBDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SMBDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SMBVR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SMDDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VB1"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["VB10"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["AVKR"] = function () {
    BRAIN.postSynaptic["ADEL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AQR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVKL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["BDUL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVL10"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVPL"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["PVQL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RICL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIGR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIML"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RIMR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RMDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMFL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SAADL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SMBDL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["SMBDR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["SMBVR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SMDDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SMDDR"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["AVL"] = function () {
    BRAIN.postSynaptic["AVEL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVFR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DA2"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DD1"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DD6"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["DVB"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DVC"][BRAIN.nextState] += 9;
    BRAIN.postSynaptic["HSNR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVL10"][BRAIN.nextState] += -5;
    BRAIN.postSynaptic["MVR10"][BRAIN.nextState] += -5;
    BRAIN.postSynaptic["PVM"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVPR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVWL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SABD"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["SABVL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["SABVR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["VD12"][BRAIN.nextState] += 4;
  };
  BRAIN.connectome["AVM"] = function () {
    BRAIN.postSynaptic["ADER"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ALML"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ALMR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["AVDL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVJR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["BDUL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["BDUR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["DA1"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVCL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["PVCR"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["PVNL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RID"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SIBVL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VA1"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["AWAL"] = function () {
    BRAIN.postSynaptic["ADAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AFDL"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["AIAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AIYL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AIZL"][BRAIN.nextState] += 10;
    BRAIN.postSynaptic["ASEL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["ASGL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AWAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AWBL"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["AWAR"] = function () {
    BRAIN.postSynaptic["ADFR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AFDR"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["AIAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AIYR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AIZR"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["AIZR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ASEL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ASER"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AUAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AWAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AWBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIFR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RIGR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIR"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["AWBL"] = function () {
    BRAIN.postSynaptic["ADFL"][BRAIN.nextState] += 9;
    BRAIN.postSynaptic["AIBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AIZL"][BRAIN.nextState] += 9;
    BRAIN.postSynaptic["AUAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AWBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIAL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RMGL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SMBDL"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["AWBR"] = function () {
    BRAIN.postSynaptic["ADFR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["AIZR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["ASGR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ASHR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AUAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AWBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RICL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RMGR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SMBVR"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["AWCL"] = function () {
    BRAIN.postSynaptic["AIAL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AIAR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["AIBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AIBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AIYL"][BRAIN.nextState] += 10;
    BRAIN.postSynaptic["ASEL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AWCR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIAL"][BRAIN.nextState] += 3;
  };
  BRAIN.connectome["AWCR"] = function () {
    BRAIN.postSynaptic["AIAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AIBR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["AIYL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["AIYR"][BRAIN.nextState] += 9;
    BRAIN.postSynaptic["ASEL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ASGR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AWCL"][BRAIN.nextState] += 5;
  };
  BRAIN.connectome["BAGL"] = function () {
    BRAIN.postSynaptic["AIBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVEL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVER"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["BAGR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RIAR"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["RIBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIBR"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["RIGL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIGR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["RIGR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIR"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["BAGR"] = function () {
    BRAIN.postSynaptic["AIYL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVEL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["BAGL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIAL"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["RIBL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["RIGL"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["RIGL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIR"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["BDUL"] = function () {
    BRAIN.postSynaptic["ADEL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AVHL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVJR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["HSNL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVNL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["PVNR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["SAADL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["URADL"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["BDUR"] = function () {
    BRAIN.postSynaptic["ADER"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ALMR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AVHL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVJL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["HSNR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["PVCL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVNL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["PVNR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SDQL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["URADR"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["CEPDL"] = function () {
    BRAIN.postSynaptic["AVER"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["IL1DL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["OLLL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["OLQDL"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["OLQDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIBL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RICL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RICR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RIH"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIPL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RIS"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDVL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RMGL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["RMHR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["SIADR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SMBDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["URADL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["URBL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["URYDL"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["CEPDR"] = function () {
    BRAIN.postSynaptic["AVEL"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["BDUR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["IL1DR"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["IL1R"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["OLLR"][BRAIN.nextState] += 8;
    BRAIN.postSynaptic["OLQDR"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["OLQDR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RIBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RICL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["RICR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RIH"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIS"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDVR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RMGR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMHL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["RMHR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SIADL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SMBDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["URADR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["URBR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["URYDR"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["CEPVL"] = function () {
    BRAIN.postSynaptic["ADLL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVER"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["IL1VL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MVL03"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["OLLL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["OLQVL"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["OLQVL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RICL"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["RICR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["RIH"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIPL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDDL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["RMHL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SIAVL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["URAVL"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["CEPVR"] = function () {
    BRAIN.postSynaptic["ASGR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVEL"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["IL1VR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["IL2VR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MVR04"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["OLLR"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["OLQVR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["OLQVR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RICL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RICR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RIH"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIPR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIVL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDDR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RMHR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["SIAVR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["URAVR"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["DA1"] = function () {
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["DA4"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DD1"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["MDL08"][BRAIN.nextState] += 8;
    BRAIN.postSynaptic["MDR08"][BRAIN.nextState] += 8;
    BRAIN.postSynaptic["SABVL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["SABVR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["VD1"][BRAIN.nextState] += 17;
    BRAIN.postSynaptic["VD2"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["DA2"] = function () {
    BRAIN.postSynaptic["AS2"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AS3"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["DD1"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDL07"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDL08"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDL09"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDL10"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDR07"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDR08"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDR09"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDR10"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["SABVL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VA1"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VD1"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VD2"][BRAIN.nextState] += 11;
    BRAIN.postSynaptic["VD3"][BRAIN.nextState] += 5;
  };
  BRAIN.connectome["DA3"] = function () {
    BRAIN.postSynaptic["AS4"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["DA4"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["DB3"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DD2"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDL09"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MDL10"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MDL12"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MDR09"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MDR10"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MDR12"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["VD3"][BRAIN.nextState] += 25;
    BRAIN.postSynaptic["VD4"][BRAIN.nextState] += 6;
  };
  BRAIN.connectome["DA4"] = function () {
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["DA1"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DA3"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DB3"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["DD2"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDL11"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["MDL12"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["MDL14"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MDR11"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["MDR12"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["MDR14"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["VB6"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD4"][BRAIN.nextState] += 12;
    BRAIN.postSynaptic["VD5"][BRAIN.nextState] += 15;
  };
  BRAIN.connectome["DA5"] = function () {
    BRAIN.postSynaptic["AS6"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["DB4"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDL13"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MDL14"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["MDR13"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MDR14"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["VA4"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VA5"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VD5"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD6"][BRAIN.nextState] += 16;
  };
  BRAIN.connectome["DA6"] = function () {
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 10;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDL11"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["MDL12"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["MDL13"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["MDL14"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["MDL16"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["MDR11"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["MDR12"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["MDR13"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["MDR14"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["MDR16"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["VD4"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["VD5"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["VD6"][BRAIN.nextState] += 3;
  };
  BRAIN.connectome["DA7"] = function () {
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDL15"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["MDL17"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["MDL18"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["MDR15"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["MDR17"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["MDR18"][BRAIN.nextState] += 4;
  };
  BRAIN.connectome["DA8"] = function () {
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DA9"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDL17"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["MDL19"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["MDL20"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["MDR17"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["MDR19"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["MDR20"][BRAIN.nextState] += 4;
  };
  BRAIN.connectome["DA9"] = function () {
    BRAIN.postSynaptic["DA8"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DD6"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDL19"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["MDL21"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["MDL22"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["MDL23"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["MDL24"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["MDR19"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["MDR21"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["MDR22"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["MDR23"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["MDR24"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["PDA"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PHCL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RID"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD13"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["DB1"] = function () {
    BRAIN.postSynaptic["AIBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AS1"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AS2"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AS3"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["DB2"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DB4"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DD1"][BRAIN.nextState] += 10;
    BRAIN.postSynaptic["DVA"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDL07"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDL08"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDR07"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDR08"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RID"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIS"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VB3"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VB4"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD1"][BRAIN.nextState] += 21;
    BRAIN.postSynaptic["VD2"][BRAIN.nextState] += 15;
    BRAIN.postSynaptic["VD3"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["DB2"] = function () {
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DA3"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["DB1"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DB3"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["DD2"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["MDL09"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["MDL10"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["MDL11"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["MDL12"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["MDR09"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["MDR10"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["MDR11"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["MDR12"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["VB1"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VD3"][BRAIN.nextState] += 23;
    BRAIN.postSynaptic["VD4"][BRAIN.nextState] += 14;
    BRAIN.postSynaptic["VD5"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["DB3"] = function () {
    BRAIN.postSynaptic["AS4"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AS5"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DA4"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DB2"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["DB4"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DD2"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["DD3"][BRAIN.nextState] += 10;
    BRAIN.postSynaptic["MDL11"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["MDL12"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["MDL13"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["MDL14"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["MDR11"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["MDR12"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["MDR13"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["MDR14"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["VD4"][BRAIN.nextState] += 9;
    BRAIN.postSynaptic["VD5"][BRAIN.nextState] += 26;
    BRAIN.postSynaptic["VD6"][BRAIN.nextState] += 7;
  };
  BRAIN.connectome["DB4"] = function () {
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DB1"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DB3"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DD3"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["MDL13"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDL14"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDL16"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDR13"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDR14"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDR16"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VB2"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VB4"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD6"][BRAIN.nextState] += 13;
  };
  BRAIN.connectome["DB5"] = function () {
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDL15"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDL17"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDL18"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDR15"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDR17"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDR18"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["DB6"] = function () {
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDL17"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDL19"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDL20"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDR17"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDR19"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDR20"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["DB7"] = function () {
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDL19"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDL21"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDL22"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDL23"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDL24"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDR19"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDR21"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDR22"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDR23"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDR24"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VD13"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["DD1"] = function () {
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DD2"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["MDL07"][BRAIN.nextState] += -6;
    BRAIN.postSynaptic["MDL08"][BRAIN.nextState] += -6;
    BRAIN.postSynaptic["MDL09"][BRAIN.nextState] += -7;
    BRAIN.postSynaptic["MDL10"][BRAIN.nextState] += -6;
    BRAIN.postSynaptic["MDR07"][BRAIN.nextState] += -6;
    BRAIN.postSynaptic["MDR08"][BRAIN.nextState] += -6;
    BRAIN.postSynaptic["MDR09"][BRAIN.nextState] += -7;
    BRAIN.postSynaptic["MDR10"][BRAIN.nextState] += -6;
    BRAIN.postSynaptic["VD1"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["VD2"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD2"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["DD2"] = function () {
    BRAIN.postSynaptic["DA3"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DD1"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DD3"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDL09"][BRAIN.nextState] += -6;
    BRAIN.postSynaptic["MDL11"][BRAIN.nextState] += -7;
    BRAIN.postSynaptic["MDL12"][BRAIN.nextState] += -6;
    BRAIN.postSynaptic["MDR09"][BRAIN.nextState] += -6;
    BRAIN.postSynaptic["MDR11"][BRAIN.nextState] += -7;
    BRAIN.postSynaptic["MDR12"][BRAIN.nextState] += -6;
    BRAIN.postSynaptic["VD3"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD4"][BRAIN.nextState] += 3;
  };
  BRAIN.connectome["DD3"] = function () {
    BRAIN.postSynaptic["DD2"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["DD4"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDL11"][BRAIN.nextState] += -7;
    BRAIN.postSynaptic["MDL13"][BRAIN.nextState] += -9;
    BRAIN.postSynaptic["MDL14"][BRAIN.nextState] += -7;
    BRAIN.postSynaptic["MDR11"][BRAIN.nextState] += -7;
    BRAIN.postSynaptic["MDR13"][BRAIN.nextState] += -9;
    BRAIN.postSynaptic["MDR14"][BRAIN.nextState] += -7;
  };
  BRAIN.connectome["DD4"] = function () {
    BRAIN.postSynaptic["DD3"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDL13"][BRAIN.nextState] += -7;
    BRAIN.postSynaptic["MDL15"][BRAIN.nextState] += -7;
    BRAIN.postSynaptic["MDL16"][BRAIN.nextState] += -7;
    BRAIN.postSynaptic["MDR13"][BRAIN.nextState] += -7;
    BRAIN.postSynaptic["MDR15"][BRAIN.nextState] += -7;
    BRAIN.postSynaptic["MDR16"][BRAIN.nextState] += -7;
    BRAIN.postSynaptic["VC3"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD8"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["DD5"] = function () {
    BRAIN.postSynaptic["MDL17"][BRAIN.nextState] += -7;
    BRAIN.postSynaptic["MDL18"][BRAIN.nextState] += -7;
    BRAIN.postSynaptic["MDL20"][BRAIN.nextState] += -7;
    BRAIN.postSynaptic["MDR17"][BRAIN.nextState] += -7;
    BRAIN.postSynaptic["MDR18"][BRAIN.nextState] += -7;
    BRAIN.postSynaptic["MDR20"][BRAIN.nextState] += -7;
    BRAIN.postSynaptic["VB8"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD10"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD9"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["DD6"] = function () {
    BRAIN.postSynaptic["MDL19"][BRAIN.nextState] += -7;
    BRAIN.postSynaptic["MDL21"][BRAIN.nextState] += -7;
    BRAIN.postSynaptic["MDL22"][BRAIN.nextState] += -7;
    BRAIN.postSynaptic["MDL23"][BRAIN.nextState] += -7;
    BRAIN.postSynaptic["MDL24"][BRAIN.nextState] += -7;
    BRAIN.postSynaptic["MDR19"][BRAIN.nextState] += -7;
    BRAIN.postSynaptic["MDR21"][BRAIN.nextState] += -7;
    BRAIN.postSynaptic["MDR22"][BRAIN.nextState] += -7;
    BRAIN.postSynaptic["MDR23"][BRAIN.nextState] += -7;
    BRAIN.postSynaptic["MDR24"][BRAIN.nextState] += -7;
  };
  BRAIN.connectome["DVA"] = function () {
    BRAIN.postSynaptic["AIZL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AQR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["AUAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AUAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVEL"][BRAIN.nextState] += 9;
    BRAIN.postSynaptic["AVER"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["DB1"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DB2"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DB3"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["DB4"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DB5"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DB6"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["DB7"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PDEL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["PVCL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["PVCL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVCR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["PVR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RIAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIMR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["SAADR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SAAVL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SAAVR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SABD"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SMBDL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["SMBDR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["SMBVL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["SMBVR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VA12"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VA2"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VB1"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VB11"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["DVB"] = function () {
    BRAIN.postSynaptic["AS9"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["AVL"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["AVL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DA8"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["DD6"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["DVC"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["PDA"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PHCL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVPL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VA9"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VB9"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["DVC"] = function () {
    BRAIN.postSynaptic["AIBL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AIBR"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVKL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVKR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVL"][BRAIN.nextState] += 9;
    BRAIN.postSynaptic["PVPL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["PVPR"][BRAIN.nextState] += 13;
    BRAIN.postSynaptic["PVT"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIGL"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["RIGR"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["RMFL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RMFR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["VA9"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD1"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["VD10"][BRAIN.nextState] += 4;
  };
  BRAIN.connectome["FLPL"] = function () {
    BRAIN.postSynaptic["ADEL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["ADER"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AIBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AIBR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 15;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 17;
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["AVDL"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["AVDR"][BRAIN.nextState] += 13;
    BRAIN.postSynaptic["DVA"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["FLPR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RIH"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["FLPR"] = function () {
    BRAIN.postSynaptic["ADER"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AIBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 12;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVDL"][BRAIN.nextState] += 10;
    BRAIN.postSynaptic["AVDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVDR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVEL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["AVER"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVJR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DVA"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["FLPL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["PVCL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VB1"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["HSNL"] = function () {
    BRAIN.postSynaptic["AIAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AIZL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AIZR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ASHL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ASHR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["ASJR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ASKL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVDR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVFL"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["AVJL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AWBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AWBR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["HSNR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["HSNR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVULVA"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["RIFL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RIML"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["SABVL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VC5"][BRAIN.nextState] += 3;
  };
  BRAIN.connectome["HSNR"] = function () {
    BRAIN.postSynaptic["AIBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AIBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AIZL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AIZR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AS5"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ASHL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVFL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVJL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AWBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["BDUR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DA5"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DA6"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["HSNL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MVULVA"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["PVNR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["PVQR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIFR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["RMGR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SABD"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SABVR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VA6"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VC2"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["VC3"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD4"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["I1L"] = function () {
    BRAIN.postSynaptic["I1R"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["I3"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["I5"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIPL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIPR"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["I1R"] = function () {
    BRAIN.postSynaptic["I1L"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["I3"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["I5"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIPL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIPR"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["I2L"] = function () {
    BRAIN.postSynaptic["I1L"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["I1R"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["M1"][BRAIN.nextState] += 4;
  };
  BRAIN.connectome["I2R"] = function () {
    BRAIN.postSynaptic["I1L"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["I1R"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["M1"][BRAIN.nextState] += 4;
  };
  BRAIN.connectome["I3"] = function () {
    BRAIN.postSynaptic["M1"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["M2L"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["M2R"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["I4"] = function () {
    BRAIN.postSynaptic["I2L"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["I2R"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["I5"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["M1"][BRAIN.nextState] += 4;
  };
  BRAIN.connectome["I5"] = function () {
    BRAIN.postSynaptic["I1L"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["I1R"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["M1"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["M5"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MI"][BRAIN.nextState] += 4;
  };
  BRAIN.connectome["I6"] = function () {
    BRAIN.postSynaptic["I2L"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["I2R"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["I3"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["M4"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["M5"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["NSML"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["NSMR"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["IL1DL"] = function () {
    BRAIN.postSynaptic["IL1DR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["IL1L"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDL01"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDL02"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDL04"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["OLLL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIH"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIPL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RMDDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDVL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["RMEV"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["URYDL"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["IL1DR"] = function () {
    BRAIN.postSynaptic["IL1DL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["IL1R"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDR01"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["MDR02"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["OLLR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIPR"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["RMDVR"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["RMEV"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["IL1L"] = function () {
    BRAIN.postSynaptic["AVER"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["IL1DL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["IL1VL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDL01"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["MDL03"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["MDL05"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["MVL01"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["MVL03"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RMDDL"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["RMDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RMDVL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["RMDVR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RMER"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["IL1R"] = function () {
    BRAIN.postSynaptic["AVEL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVER"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["IL1DR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["IL1VR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDR01"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["MDR03"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["MVR01"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["MVR03"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RMDDL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RMDDR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RMDL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["RMDR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RMDVL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDVR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["RMEL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RMHL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["URXR"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["IL1VL"] = function () {
    BRAIN.postSynaptic["IL1L"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["IL1VR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVL01"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MVL02"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["RIPL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["RMDDL"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["RMED"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["URYVL"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["IL1VR"] = function () {
    BRAIN.postSynaptic["IL1R"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["IL1VL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["IL2R"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["IL2VR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVR01"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MVR02"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["RIPR"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["RMDDR"][BRAIN.nextState] += 10;
    BRAIN.postSynaptic["RMER"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["IL2DL"] = function () {
    BRAIN.postSynaptic["AUAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["IL1DL"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["OLQDL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RIBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIPL"][BRAIN.nextState] += 10;
    BRAIN.postSynaptic["RMEL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["RMER"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["URADL"][BRAIN.nextState] += 3;
  };
  BRAIN.connectome["IL2DR"] = function () {
    BRAIN.postSynaptic["CEPDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["IL1DR"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["RICR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIPR"][BRAIN.nextState] += 11;
    BRAIN.postSynaptic["RMED"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMEL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RMER"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RMEV"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["URADR"][BRAIN.nextState] += 3;
  };
  BRAIN.connectome["IL2L"] = function () {
    BRAIN.postSynaptic["ADEL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVEL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["IL1L"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["OLQDL"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["OLQVL"][BRAIN.nextState] += 8;
    BRAIN.postSynaptic["RICL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIH"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["RMDL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RMDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMER"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RMEV"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RMGL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["URXL"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["IL2R"] = function () {
    BRAIN.postSynaptic["ADER"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["IL1R"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["IL1VR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["OLLR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["OLQDR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["OLQVR"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["RIH"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["RMDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMEL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RMEV"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMGR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["URBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["URXR"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["IL2VL"] = function () {
    BRAIN.postSynaptic["BAGR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["IL1VL"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["IL2L"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["OLQVL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIH"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RIPL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMEL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMER"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["RMEV"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["URAVL"][BRAIN.nextState] += 3;
  };
  BRAIN.connectome["IL2VR"] = function () {
    BRAIN.postSynaptic["IL1VR"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["OLQVR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIAR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RIH"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RIPR"][BRAIN.nextState] += 15;
    BRAIN.postSynaptic["RMEL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RMER"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RMEV"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["URAVR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["URXR"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["LUAL"] = function () {
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["AVDL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["AVDR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVJL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PHBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PLML"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVNL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVWL"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["LUAR"] = function () {
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["AVDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVDR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AVJR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PLMR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PQR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVCR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["PVR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["PVWL"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["M1"] = function () {
    BRAIN.postSynaptic["I2L"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["I2R"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["I3"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["I4"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["M2L"] = function () {
    BRAIN.postSynaptic["I1L"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["I1R"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["I3"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["M2R"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["M5"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MI"][BRAIN.nextState] += 4;
  };
  BRAIN.connectome["M2R"] = function () {
    BRAIN.postSynaptic["I1L"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["I1R"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["I3"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["M3L"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["M3R"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["M5"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MI"][BRAIN.nextState] += 4;
  };
  BRAIN.connectome["M3L"] = function () {
    BRAIN.postSynaptic["I1L"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["I1R"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["I4"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["I5"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["I6"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["M1"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["M3R"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MCL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MCR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MI"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["NSML"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["NSMR"][BRAIN.nextState] += 3;
  };
  BRAIN.connectome["M3R"] = function () {
    BRAIN.postSynaptic["I1L"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["I1R"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["I3"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["I4"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["I5"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["I6"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["M1"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["M3L"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MCL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MCR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MI"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["NSML"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["NSMR"][BRAIN.nextState] += 3;
  };
  BRAIN.connectome["M4"] = function () {
    BRAIN.postSynaptic["I3"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["I5"][BRAIN.nextState] += 13;
    BRAIN.postSynaptic["I6"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["M2L"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["M2R"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["M4"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["M5"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["NSML"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["NSMR"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["M5"] = function () {
    BRAIN.postSynaptic["I5"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["I5"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["I6"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["M1"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["M2L"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["M2R"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["M5"][BRAIN.nextState] += 4;
  };
  BRAIN.connectome["MCL"] = function () {
    BRAIN.postSynaptic["I1L"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["I1R"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["I2L"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["I2R"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["I3"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["M1"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["M2L"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["M2R"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["MCR"] = function () {
    BRAIN.postSynaptic["I1L"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["I1R"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["I3"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["M1"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["M2L"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["M2R"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["MI"] = function () {
    BRAIN.postSynaptic["I1L"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["I1R"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["I3"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["I4"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["I5"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["M1"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["M2L"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["M2R"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["M3L"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["M3R"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MCL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MCR"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["NSML"] = function () {
    BRAIN.postSynaptic["I1L"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["I1R"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["I2L"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["I2R"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["I3"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["I4"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["I5"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["I6"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["M3L"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["M3R"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["NSMR"] = function () {
    BRAIN.postSynaptic["I1L"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["I1R"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["I2L"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["I2R"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["I3"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["I4"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["I5"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["I6"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["M3L"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["M3R"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["OLLL"] = function () {
    BRAIN.postSynaptic["AVER"][BRAIN.nextState] += 21;
    BRAIN.postSynaptic["CEPDL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["CEPVL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["IL1DL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["IL1VL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["OLLR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RIBL"][BRAIN.nextState] += 8;
    BRAIN.postSynaptic["RIGL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDDL"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["RMDL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RMDVL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMEL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["SMDDL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["SMDDR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["SMDVR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["URYDL"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["OLLR"] = function () {
    BRAIN.postSynaptic["AVEL"][BRAIN.nextState] += 16;
    BRAIN.postSynaptic["CEPDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["CEPVR"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["IL1DR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["IL1VR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["IL2R"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["OLLL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RIBR"][BRAIN.nextState] += 10;
    BRAIN.postSynaptic["RIGR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDDR"][BRAIN.nextState] += 10;
    BRAIN.postSynaptic["RMDL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RMDVR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RMER"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["SMDDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SMDVL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["SMDVR"][BRAIN.nextState] += 3;
  };
  BRAIN.connectome["OLQDL"] = function () {
    BRAIN.postSynaptic["CEPDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIBL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RICR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIGL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDDR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["RMDVL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SIBVL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["URBL"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["OLQDR"] = function () {
    BRAIN.postSynaptic["CEPDR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RIBR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RICL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RICR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIGR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIH"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDDL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RMDVR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMHR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SIBVR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["URBR"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["OLQVL"] = function () {
    BRAIN.postSynaptic["ADLL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["CEPVL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["IL1VL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["IL2VL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RICL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIGL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIH"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIPL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDVR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["SIBDL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["URBL"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["OLQVR"] = function () {
    BRAIN.postSynaptic["CEPVR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["IL1VR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RICR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIGR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIH"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RIPR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RMDDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDVL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["RMER"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SIBDR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["URBR"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["PDA"] = function () {
    BRAIN.postSynaptic["AS11"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DA9"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DD6"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDL21"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["PVNR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD13"][BRAIN.nextState] += 3;
  };
  BRAIN.connectome["PDB"] = function () {
    BRAIN.postSynaptic["AS11"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MVL22"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVR21"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RID"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VD13"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["PDEL"] = function () {
    BRAIN.postSynaptic["AVKL"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["DVA"][BRAIN.nextState] += 24;
    BRAIN.postSynaptic["PDER"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PDER"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["PVCR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVM"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["PVM"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VA9"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD11"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["PDER"] = function () {
    BRAIN.postSynaptic["AVKL"][BRAIN.nextState] += 16;
    BRAIN.postSynaptic["DVA"][BRAIN.nextState] += 35;
    BRAIN.postSynaptic["PDEL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["PVCL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVCR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVM"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VA8"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD9"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["PHAL"] = function () {
    BRAIN.postSynaptic["AVDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVFL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AVG"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["AVHL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVHR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DVA"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["PHAR"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["PHAR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["PHBL"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["PHBR"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["PVQL"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["PHAR"] = function () {
    BRAIN.postSynaptic["AVG"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AVHR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DA8"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DVA"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PHAL"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["PHAL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["PHBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PHBR"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["PVPL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["PVQL"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["PHBL"] = function () {
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 9;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["AVDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PHBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PHBR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["PVCL"][BRAIN.nextState] += 13;
    BRAIN.postSynaptic["VA12"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["PHBR"] = function () {
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["AVDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVFL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVHL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DA8"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PHBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PHBL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["PVCL"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["PVCR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["VA12"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["PHCL"] = function () {
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DA9"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["DA9"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DVA"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["LUAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PHCR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PLML"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVCL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VA12"][BRAIN.nextState] += 3;
  };
  BRAIN.connectome["PHCR"] = function () {
    BRAIN.postSynaptic["AVHR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DA9"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["DVA"][BRAIN.nextState] += 8;
    BRAIN.postSynaptic["LUAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PHCL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["PVCR"][BRAIN.nextState] += 9;
    BRAIN.postSynaptic["VA12"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["PLML"] = function () {
    BRAIN.postSynaptic["HSNL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["LUAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PHCL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVCL"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["PLMR"] = function () {
    BRAIN.postSynaptic["AS6"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVDR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["DVA"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["HSNR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["LUAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PDEL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["PDER"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["PVCL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["PVCR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVR"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["PLNL"] = function () {
    BRAIN.postSynaptic["SAADL"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["SMBVL"][BRAIN.nextState] += 6;
  };
  BRAIN.connectome["PLNR"] = function () {
    BRAIN.postSynaptic["SAADR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["SMBVR"][BRAIN.nextState] += 6;
  };
  BRAIN.connectome["PQR"] = function () {
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 8;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 11;
    BRAIN.postSynaptic["AVDL"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["AVDR"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["AVG"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["LUAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVNL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVPL"][BRAIN.nextState] += 4;
  };
  BRAIN.connectome["PVCL"] = function () {
    BRAIN.postSynaptic["AS1"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 12;
    BRAIN.postSynaptic["AVDL"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["AVDR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVEL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AVER"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVJL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["AVJR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["DA2"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DA5"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DA6"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DB2"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["DB3"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["DB4"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["DB5"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["DB6"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["DB7"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["DVA"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["PLML"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVCR"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["RID"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["RIS"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["SIBVL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VB10"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["VB11"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VB3"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VB4"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VB5"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VB6"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VB8"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VB9"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["PVCR"] = function () {
    BRAIN.postSynaptic["AQR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AS2"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 12;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 10;
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 8;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["AVDL"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["AVDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVEL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVER"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVJL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AVL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DA9"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DB2"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DB3"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["DB4"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["DB5"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DB6"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["DB7"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["FLPL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["LUAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PDEL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["PHCR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PLMR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVCL"][BRAIN.nextState] += 8;
    BRAIN.postSynaptic["PVDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVWL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["PVWR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RID"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["SIBVR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VA8"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VA9"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VB10"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VB4"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["VB6"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VB7"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["VB8"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["PVDL"] = function () {
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["DD5"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVCL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVCR"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["VD10"][BRAIN.nextState] += 6;
  };
  BRAIN.connectome["PVDR"] = function () {
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 9;
    BRAIN.postSynaptic["DVA"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["PVCL"][BRAIN.nextState] += 13;
    BRAIN.postSynaptic["PVCR"][BRAIN.nextState] += 10;
    BRAIN.postSynaptic["PVDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VA9"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["PVM"] = function () {
    BRAIN.postSynaptic["AVKL"][BRAIN.nextState] += 11;
    BRAIN.postSynaptic["AVL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVM"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DVA"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["PDEL"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["PDEL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PDER"][BRAIN.nextState] += 8;
    BRAIN.postSynaptic["PDER"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVCL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["PVR"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["PVNL"] = function () {
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AVDL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AVDR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AVEL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVFR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVG"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVJL"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["AVJR"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["AVL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["BDUL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["BDUR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["DD1"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MVL09"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["PQR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVCL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVNR"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["PVQR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVT"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVWL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIFL"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["PVNR"] = function () {
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVEL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AVJL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["AVJR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["BDUL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["BDUR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["DD3"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["HSNR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MVL12"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVL13"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["PQR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["PVCL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVNL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVT"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["PVWL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VC2"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VC3"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD12"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD6"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD7"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["PVPL"] = function () {
    BRAIN.postSynaptic["ADAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AQR"][BRAIN.nextState] += 8;
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["AVDR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVER"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVHR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVKL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVKR"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["DVC"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["PHAR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["PQR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["PVCR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["PVPR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVT"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIGL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VD13"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VD3"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["PVPR"] = function () {
    BRAIN.postSynaptic["ADFR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AQR"][BRAIN.nextState] += 11;
    BRAIN.postSynaptic["ASHR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["AVHL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AVKL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["DD2"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DVC"][BRAIN.nextState] += 14;
    BRAIN.postSynaptic["PVCL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["PVCR"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["PVPL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVQR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIAR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RIGR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIMR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMGR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD4"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD5"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["PVQL"] = function () {
    BRAIN.postSynaptic["ADAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AIAL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["ASJL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ASKL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["ASKL"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["HSNL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["PVQR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RMGL"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["PVQR"] = function () {
    BRAIN.postSynaptic["ADAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AIAR"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["ASER"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ASKR"][BRAIN.nextState] += 8;
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVFL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVFR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AWAR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["DD1"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DVC"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["HSNR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVNL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVQL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVT"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIFR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD1"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["PVR"] = function () {
    BRAIN.postSynaptic["ADAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ALML"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AS6"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["AVJL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AVJR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVKL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DA9"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DB2"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DB3"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DVA"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["IL1DL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["IL1DR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["IL1VL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["IL1VR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["LUAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["LUAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PDEL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PDER"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PLMR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["PVCR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIPL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RIPR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["SABD"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["URADL"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["PVT"] = function () {
    BRAIN.postSynaptic["AIBL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AIBR"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["AVKL"][BRAIN.nextState] += 9;
    BRAIN.postSynaptic["AVKR"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["AVL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["DVC"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["PVPL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIGL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RIGR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RIH"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMEV"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMFL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RMFR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["SMBDR"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["PVWL"] = function () {
    BRAIN.postSynaptic["AVJL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVCR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["PVT"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["PVWR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VA12"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["PVWR"] = function () {
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVCR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["PVT"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VA12"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["RIAL"] = function () {
    BRAIN.postSynaptic["CEPVL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIVL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RIVR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["RMDDL"][BRAIN.nextState] += 12;
    BRAIN.postSynaptic["RMDDR"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["RMDL"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["RMDR"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["RMDVL"][BRAIN.nextState] += 9;
    BRAIN.postSynaptic["RMDVR"][BRAIN.nextState] += 11;
    BRAIN.postSynaptic["SIADL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["SMDDL"][BRAIN.nextState] += 8;
    BRAIN.postSynaptic["SMDDR"][BRAIN.nextState] += 10;
    BRAIN.postSynaptic["SMDVL"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["SMDVR"][BRAIN.nextState] += 11;
  };
  BRAIN.connectome["RIAR"] = function () {
    BRAIN.postSynaptic["CEPVR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["IL1R"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIAL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["RIVL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDDL"][BRAIN.nextState] += 10;
    BRAIN.postSynaptic["RMDDR"][BRAIN.nextState] += 11;
    BRAIN.postSynaptic["RMDL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RMDR"][BRAIN.nextState] += 8;
    BRAIN.postSynaptic["RMDVL"][BRAIN.nextState] += 12;
    BRAIN.postSynaptic["RMDVR"][BRAIN.nextState] += 10;
    BRAIN.postSynaptic["SAADR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SIADL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SIADR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SIAVL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SMDDL"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["SMDDR"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["SMDVL"][BRAIN.nextState] += 13;
    BRAIN.postSynaptic["SMDVR"][BRAIN.nextState] += 7;
  };
  BRAIN.connectome["RIBL"] = function () {
    BRAIN.postSynaptic["AIBR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AUAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVEL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVER"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["BAGR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["OLQDL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["OLQVL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVT"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIAL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RIBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIBR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RIGL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SIADL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SIAVL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SIBDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SIBVL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SIBVR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SMBDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SMDDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SMDVR"][BRAIN.nextState] += 4;
  };
  BRAIN.connectome["RIBR"] = function () {
    BRAIN.postSynaptic["AIBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AIZR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVEL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AVER"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["BAGL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["OLQDR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["OLQVR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVT"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIAR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RIBL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RIBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIGR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RIH"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SIADR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SIAVR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SIBDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SIBVR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SMBDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SMDDL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["SMDDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SMDVL"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["RICL"] = function () {
    BRAIN.postSynaptic["ADAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ASHL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["AVKL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVKR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AWBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIML"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIMR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RIVR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMFR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SMBDL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["SMDDL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["SMDDR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["SMDVR"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["RICR"] = function () {
    BRAIN.postSynaptic["ADAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ASHR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["AVKL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SMBDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SMDDL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["SMDDR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["SMDVL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["SMDVR"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["RID"] = function () {
    BRAIN.postSynaptic["ALA"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AS2"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["DA6"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["DA9"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DB1"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DD1"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["DD2"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["DD3"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["MDL14"][BRAIN.nextState] += -2;
    BRAIN.postSynaptic["MDL21"][BRAIN.nextState] += -3;
    BRAIN.postSynaptic["PDB"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VD13"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD5"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["RIFL"] = function () {
    BRAIN.postSynaptic["ALML"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 10;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVG"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVHR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVJR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["PVPL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RIML"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["VD1"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["RIFR"] = function () {
    BRAIN.postSynaptic["ASHR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 17;
    BRAIN.postSynaptic["AVFL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVG"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVHL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVJL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVJR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["HSNR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVCL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVCR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVPR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["RIMR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["RIPR"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["RIGL"] = function () {
    BRAIN.postSynaptic["AIBR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AIZR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ALNL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AQR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVEL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVER"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVKL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVKR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["BAGR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["DVC"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["OLLL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["OLQDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["OLQVL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIBL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RIGR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RIR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RMEL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RMHR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["URYDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["URYVL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VB2"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD1"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["RIGR"] = function () {
    BRAIN.postSynaptic["AIBL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["ALNR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AQR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVER"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVKL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["AVKR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["BAGL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["OLLR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["OLQDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["OLQVR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIBR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RIGL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RIR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMHL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["URYDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["URYVR"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["RIH"] = function () {
    BRAIN.postSynaptic["ADFR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AIZL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["AIZR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["AUAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["BAGR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["CEPDL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["CEPDR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["CEPVL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["CEPVR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["FLPL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["IL2L"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["IL2R"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["OLQDL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["OLQDR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["OLQVL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["OLQVR"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["RIAL"][BRAIN.nextState] += 10;
    BRAIN.postSynaptic["RIAR"][BRAIN.nextState] += 8;
    BRAIN.postSynaptic["RIBL"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["RIBR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["RIPL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["RIPR"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["RMER"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RMEV"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["URYVR"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["RIML"] = function () {
    BRAIN.postSynaptic["AIBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AIYL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AVEL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVER"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["MDR05"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MVR05"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RIBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIS"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMFR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SAADR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SAAVL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["SAAVR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["SMDDR"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["SMDVL"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["RIMR"] = function () {
    BRAIN.postSynaptic["ADAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AIBL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["AIBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AIYR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["AVEL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AVER"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVJL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVKL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDL05"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDL07"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVL05"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVL07"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIS"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RMDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMFL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMFR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SAAVL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["SAAVR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["SMDDL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["SMDDR"][BRAIN.nextState] += 4;
  };
  BRAIN.connectome["RIPL"] = function () {
    BRAIN.postSynaptic["OLQDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["OLQDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMED"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["RIPR"] = function () {
    BRAIN.postSynaptic["OLQDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["OLQDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMED"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["RIR"] = function () {
    BRAIN.postSynaptic["AFDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AIZL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AIZR"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["AUAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AWBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["BAGL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["BAGR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["DVA"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["HSNL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVPL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIAL"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["RIAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIGL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["URXL"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["URXR"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["RIS"] = function () {
    BRAIN.postSynaptic["AIBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVEL"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["AVER"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["AVJL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVKL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVKR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["AVL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["CEPDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["CEPVL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["CEPVR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DB1"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["OLLR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIBL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RIBR"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["RIML"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RIMR"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["RMDDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RMDR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["SMDDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SMDDR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["SMDVL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SMDVR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["URYVR"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["RIVL"] = function () {
    BRAIN.postSynaptic["AIBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVR05"][BRAIN.nextState] += -2;
    BRAIN.postSynaptic["MVR06"][BRAIN.nextState] += -2;
    BRAIN.postSynaptic["MVR08"][BRAIN.nextState] += -3;
    BRAIN.postSynaptic["RIAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIVR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RMDL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["SAADR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["SDQR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["SIAVR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["SMDDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SMDVL"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["RIVR"] = function () {
    BRAIN.postSynaptic["AIBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVL05"][BRAIN.nextState] += -2;
    BRAIN.postSynaptic["MVL06"][BRAIN.nextState] += -2;
    BRAIN.postSynaptic["MVL08"][BRAIN.nextState] += -2;
    BRAIN.postSynaptic["MVR04"][BRAIN.nextState] += -2;
    BRAIN.postSynaptic["MVR06"][BRAIN.nextState] += -2;
    BRAIN.postSynaptic["RIAL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RIAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIVL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RMDDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDVR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMEV"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SAADL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["SDQR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["SIAVL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["SMDDL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["SMDVR"][BRAIN.nextState] += 4;
  };
  BRAIN.connectome["RMDDL"] = function () {
    BRAIN.postSynaptic["MDR01"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDR02"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDR03"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDR04"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDR08"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MVR01"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["OLQVL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDVL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDVR"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["SMDDL"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["RMDDR"] = function () {
    BRAIN.postSynaptic["MDL01"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDL02"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDL03"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDL04"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDR04"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVR01"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVR02"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["OLQVR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDVL"][BRAIN.nextState] += 12;
    BRAIN.postSynaptic["RMDVR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SAADR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SMDDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["URYDL"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["RMDL"] = function () {
    BRAIN.postSynaptic["MDL03"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDL05"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDR01"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDR03"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVL01"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVR01"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVR03"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVR05"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MVR07"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["OLLR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RIAL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["RIAR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RMDDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RMDVL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMER"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMFL"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["RMDR"] = function () {
    BRAIN.postSynaptic["AVKL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDL03"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDL05"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDR05"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVL03"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVL05"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIAL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RIAR"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["RIMR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RIS"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDVR"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["RMDVL"] = function () {
    BRAIN.postSynaptic["AVER"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDR01"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVL04"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVR01"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVR02"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVR03"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVR04"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVR05"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVR06"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVR08"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["OLQDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDDR"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["RMDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDVR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SAAVL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SMDVL"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["RMDVR"] = function () {
    BRAIN.postSynaptic["AVEL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVER"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDL01"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVL01"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVL02"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVL03"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVL04"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVL05"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVL06"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVL08"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVR04"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVR06"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVR08"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["OLQDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDDL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["RMDDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDVL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SAAVR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SIBDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SIBVR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SMDVR"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["RMED"] = function () {
    BRAIN.postSynaptic["IL1VL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVL02"][BRAIN.nextState] += -4;
    BRAIN.postSynaptic["MVL04"][BRAIN.nextState] += -4;
    BRAIN.postSynaptic["MVL06"][BRAIN.nextState] += -4;
    BRAIN.postSynaptic["MVR02"][BRAIN.nextState] += -4;
    BRAIN.postSynaptic["MVR04"][BRAIN.nextState] += -4;
    BRAIN.postSynaptic["RIBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIPL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIPR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMEV"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["RMEL"] = function () {
    BRAIN.postSynaptic["MDR01"][BRAIN.nextState] += -5;
    BRAIN.postSynaptic["MDR03"][BRAIN.nextState] += -5;
    BRAIN.postSynaptic["MVR01"][BRAIN.nextState] += -5;
    BRAIN.postSynaptic["MVR03"][BRAIN.nextState] += -5;
    BRAIN.postSynaptic["RIGL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMEV"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["RMER"] = function () {
    BRAIN.postSynaptic["MDL01"][BRAIN.nextState] += -7;
    BRAIN.postSynaptic["MDL03"][BRAIN.nextState] += -7;
    BRAIN.postSynaptic["MVL01"][BRAIN.nextState] += -7;
    BRAIN.postSynaptic["RMEV"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["RMEV"] = function () {
    BRAIN.postSynaptic["AVEL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVER"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["IL1DL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["IL1DR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDL02"][BRAIN.nextState] += -3;
    BRAIN.postSynaptic["MDL04"][BRAIN.nextState] += -3;
    BRAIN.postSynaptic["MDL06"][BRAIN.nextState] += -3;
    BRAIN.postSynaptic["MDR02"][BRAIN.nextState] += -3;
    BRAIN.postSynaptic["MDR04"][BRAIN.nextState] += -3;
    BRAIN.postSynaptic["RMED"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RMEL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMER"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SMDDR"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["RMFL"] = function () {
    BRAIN.postSynaptic["AVKL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["AVKR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["MDR03"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVR01"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVR03"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVT"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIGR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RMGR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["URBR"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["RMFR"] = function () {
    BRAIN.postSynaptic["AVKL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AVKR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RMDL"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["RMGL"] = function () {
    BRAIN.postSynaptic["ADAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ADLL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AIBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ALML"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ALNL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ASHL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["ASKL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVEL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AWBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["CEPDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["IL2L"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDL05"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MVL05"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RID"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RMDVL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RMHL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RMHR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SIAVL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SIBVL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["SIBVR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SMBVL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["URXL"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["RMGR"] = function () {
    BRAIN.postSynaptic["ADAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AIMR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ALNR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ASHR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["ASKR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVER"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AVJL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AWBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["IL2R"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDR05"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVR05"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVR07"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["RMDR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RMDVR"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["RMHR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["URXR"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["RMHL"] = function () {
    BRAIN.postSynaptic["MDR01"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDR03"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["MVR01"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RMDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMGL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["SIBVR"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["RMHR"] = function () {
    BRAIN.postSynaptic["MDL01"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDL03"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDL05"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MVL01"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RMER"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMGL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMGR"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["SAADL"] = function () {
    BRAIN.postSynaptic["AIBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["RIML"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RIMR"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["RMGR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SMBDL"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["SAADR"] = function () {
    BRAIN.postSynaptic["AIBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["OLLL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIML"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["RIMR"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["RMDDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMFL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMGL"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["SAAVL"] = function () {
    BRAIN.postSynaptic["AIBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["ALNL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 16;
    BRAIN.postSynaptic["OLLR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIML"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RIMR"][BRAIN.nextState] += 12;
    BRAIN.postSynaptic["RMDVL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RMFR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["SMBVR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["SMDDR"][BRAIN.nextState] += 8;
  };
  BRAIN.connectome["SAAVR"] = function () {
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 13;
    BRAIN.postSynaptic["RIML"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["RIMR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RMDVR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SMBVL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["SMDDL"][BRAIN.nextState] += 6;
  };
  BRAIN.connectome["SABD"] = function () {
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["VA2"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["VA3"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VA4"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["SABVL"] = function () {
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["DA1"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["DA2"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["SABVR"] = function () {
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DA1"][BRAIN.nextState] += 3;
  };
  BRAIN.connectome["SDQL"] = function () {
    BRAIN.postSynaptic["ALML"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AVEL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["FLPL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RICR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIS"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RMFL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SDQR"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["SDQR"] = function () {
    BRAIN.postSynaptic["ADLL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AIBL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["DVA"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RICR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIVL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RIVR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RMHL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RMHR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SDQL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SIBVL"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["SIADL"] = function () {
    BRAIN.postSynaptic["RIBL"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["SIADR"] = function () {
    BRAIN.postSynaptic["RIBR"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["SIAVL"] = function () {
    BRAIN.postSynaptic["RIBL"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["SIAVR"] = function () {
    BRAIN.postSynaptic["RIBR"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["SIBDL"] = function () {
    BRAIN.postSynaptic["RIBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SIBVL"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["SIBDR"] = function () {
    BRAIN.postSynaptic["AIML"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SIBVR"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["SIBVL"] = function () {
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SDQR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SIBDL"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["SIBVR"] = function () {
    BRAIN.postSynaptic["RIBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMHL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SIBDR"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["SMBDL"] = function () {
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVKL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVKR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDR01"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDR02"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDR03"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDR04"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDR06"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RIBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMED"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["SAADL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SAAVR"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["SMBDR"] = function () {
    BRAIN.postSynaptic["ALNL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVKL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVKR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDL02"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDL03"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDL04"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDL06"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDR04"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDR08"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMED"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["SAAVL"][BRAIN.nextState] += 3;
  };
  BRAIN.connectome["SMBVL"] = function () {
    BRAIN.postSynaptic["MVL01"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVL02"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVL03"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVL04"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVL05"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVL06"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVL08"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PLNL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMEV"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["SAADL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["SAAVR"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["SMBVR"] = function () {
    BRAIN.postSynaptic["AVKL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVKR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVR01"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVR02"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVR03"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVR04"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVR06"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVR07"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMEV"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["SAADR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["SAAVL"][BRAIN.nextState] += 3;
  };
  BRAIN.connectome["SMDDL"] = function () {
    BRAIN.postSynaptic["MDL04"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDL06"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDL08"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDR02"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDR03"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDR04"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDR05"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDR06"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDR07"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVL02"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVL04"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIS"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SMDVR"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["SMDDR"] = function () {
    BRAIN.postSynaptic["MDL04"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDL05"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDL06"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDL08"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDR04"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDR06"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVR02"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIAL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RIAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIS"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD1"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["SMDVL"] = function () {
    BRAIN.postSynaptic["MVL03"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVL06"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVR02"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVR03"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVR04"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVR06"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIAL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RIAR"][BRAIN.nextState] += 8;
    BRAIN.postSynaptic["RIBR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RIS"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIVL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RMDDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDVL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SMDDR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["SMDVR"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["SMDVR"] = function () {
    BRAIN.postSynaptic["MVL02"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVL03"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVL04"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVR07"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIAL"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["RIAR"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["RIBL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RIVR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIVR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RMDDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDVR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SMDDL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["SMDVL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VB1"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["URADL"] = function () {
    BRAIN.postSynaptic["IL1DL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDL02"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDL03"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDL04"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RIPL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RMEL"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["URADR"] = function () {
    BRAIN.postSynaptic["IL1DR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MDR01"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["MDR02"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MDR03"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RIPR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RMDVR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMED"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMER"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["URYDR"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["URAVL"] = function () {
    BRAIN.postSynaptic["MVL01"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MVL02"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MVL03"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["MVL04"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RIPL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RMEL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMER"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMEV"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["URAVR"] = function () {
    BRAIN.postSynaptic["IL1R"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVR01"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MVR02"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MVR03"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MVR04"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RIPR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RMDVL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMER"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RMEV"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["URBL"] = function () {
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["CEPDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["IL1L"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["OLQDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["OLQVL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RICR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SIAVL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SMBDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["URXL"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["URBR"] = function () {
    BRAIN.postSynaptic["ADAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["CEPDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["IL1R"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["IL2R"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["OLQDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["OLQVR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RICR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMFL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SIAVR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["SMBDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["URXR"][BRAIN.nextState] += 4;
  };
  BRAIN.connectome["URXL"] = function () {
    BRAIN.postSynaptic["ASHL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AUAL"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVEL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["AVJR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIAL"][BRAIN.nextState] += 8;
    BRAIN.postSynaptic["RICL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIGL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RMGL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RMGL"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["URXR"] = function () {
    BRAIN.postSynaptic["AUAR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVER"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["IL2R"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["OLQVR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIAR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RIGR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RIPR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RMDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMGR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["SIAVR"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["URYDL"] = function () {
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVER"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RIBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIGL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDDR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["RMDVL"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["SMDDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SMDDR"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["URYDR"] = function () {
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVEL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVER"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RIBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIGR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDDL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["RMDVR"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["SMDDL"][BRAIN.nextState] += 4;
  };
  BRAIN.connectome["URYVL"] = function () {
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVER"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["IL1VL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIBL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RIGL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIH"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIS"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDDL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["RMDVR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["SIBVR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SMDVR"][BRAIN.nextState] += 4;
  };
  BRAIN.connectome["URYVR"] = function () {
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVEL"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["IL1VR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIGR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RMDDR"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["RMDVL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["SIBDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SIBVL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SMDVL"][BRAIN.nextState] += 3;
  };
  BRAIN.connectome["VA1"] = function () {
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["DA2"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["DD1"][BRAIN.nextState] += 9;
    BRAIN.postSynaptic["MVL07"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["MVL08"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["MVR07"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["MVR08"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["VD1"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["VA2"] = function () {
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["DD1"][BRAIN.nextState] += 13;
    BRAIN.postSynaptic["MVL07"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MVL10"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MVR07"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MVR10"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["SABD"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["VA3"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VB1"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VD1"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VD1"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD2"][BRAIN.nextState] += 11;
  };
  BRAIN.connectome["VA3"] = function () {
    BRAIN.postSynaptic["AS1"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["DD1"][BRAIN.nextState] += 18;
    BRAIN.postSynaptic["DD2"][BRAIN.nextState] += 11;
    BRAIN.postSynaptic["MVL09"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MVL10"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MVL12"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MVR09"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MVR10"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MVR12"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["SABD"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VA4"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD2"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["VD3"][BRAIN.nextState] += 3;
  };
  BRAIN.connectome["VA4"] = function () {
    BRAIN.postSynaptic["AS2"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVDL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DA5"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DD2"][BRAIN.nextState] += 21;
    BRAIN.postSynaptic["MVL11"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["MVL12"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["MVR11"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["MVR12"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["SABD"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VB3"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VD4"][BRAIN.nextState] += 3;
  };
  BRAIN.connectome["VA5"] = function () {
    BRAIN.postSynaptic["AS3"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["DA5"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["DD2"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["DD3"][BRAIN.nextState] += 13;
    BRAIN.postSynaptic["MVL11"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MVL14"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MVR11"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MVR14"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["VD5"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["VA6"] = function () {
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["DD3"][BRAIN.nextState] += 24;
    BRAIN.postSynaptic["MVL13"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MVL14"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MVR13"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MVR14"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["VB5"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VD5"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD6"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["VA7"] = function () {
    BRAIN.postSynaptic["AS5"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["DD3"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["DD4"][BRAIN.nextState] += 12;
    BRAIN.postSynaptic["MVL13"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["MVL15"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["MVL16"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["MVR13"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["MVR15"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["MVR16"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["MVULVA"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["VB3"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD7"][BRAIN.nextState] += 9;
  };
  BRAIN.connectome["VA8"] = function () {
    BRAIN.postSynaptic["AS6"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 10;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DD4"][BRAIN.nextState] += 21;
    BRAIN.postSynaptic["MVL15"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["MVL16"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["MVR15"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["MVR16"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["PDER"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVCR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VA8"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VA9"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VB6"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VB8"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VB8"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["VB9"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["VD7"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["VD8"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["VD8"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["VA9"] = function () {
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DD4"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["DD5"][BRAIN.nextState] += 15;
    BRAIN.postSynaptic["DVB"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DVC"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVL15"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MVL18"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MVR15"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MVR18"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["PVCR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVT"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VB8"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["VB8"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VB9"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["VD7"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD9"][BRAIN.nextState] += 10;
  };
  BRAIN.connectome["VA10"] = function () {
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVL17"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MVL18"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MVR17"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MVR18"][BRAIN.nextState] += 5;
  };
  BRAIN.connectome["VA11"] = function () {
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["DD6"][BRAIN.nextState] += 10;
    BRAIN.postSynaptic["MVL19"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MVL20"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MVR19"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MVR20"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["PVNR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VB10"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD12"][BRAIN.nextState] += 4;
  };
  BRAIN.connectome["VA12"] = function () {
    BRAIN.postSynaptic["AS11"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DA8"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["DA9"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["DB7"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["DD6"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["LUAL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MVL21"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MVL22"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MVL23"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MVR21"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MVR22"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MVR23"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MVR24"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["PHCL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PHCR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVCL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["PVCR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["VA11"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VB11"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD12"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["VD13"][BRAIN.nextState] += 11;
  };
  BRAIN.connectome["VB1"] = function () {
    BRAIN.postSynaptic["AIBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVKL"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["DB2"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["DD1"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DVA"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVL07"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVL08"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVR07"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVR08"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIML"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["RMFL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["SAADL"][BRAIN.nextState] += 9;
    BRAIN.postSynaptic["SAADR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["SABD"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["SMDVR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VA1"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["VA3"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VB2"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["VD1"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["VD2"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["VB2"] = function () {
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DB4"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DD1"][BRAIN.nextState] += 20;
    BRAIN.postSynaptic["DD2"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVL07"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["MVL09"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["MVL10"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["MVL12"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["MVR07"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["MVR09"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["MVR10"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["MVR12"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["RIGL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VA2"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VB1"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["VB3"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VB5"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VB7"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VC2"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD2"][BRAIN.nextState] += 9;
    BRAIN.postSynaptic["VD3"][BRAIN.nextState] += 3;
  };
  BRAIN.connectome["VB3"] = function () {
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DB1"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DD2"][BRAIN.nextState] += 37;
    BRAIN.postSynaptic["MVL11"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["MVL12"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["MVL14"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["MVR11"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["MVR12"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["MVR14"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["VA4"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VA7"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VB2"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["VB4"] = function () {
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DB1"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DB4"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DD2"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["DD3"][BRAIN.nextState] += 16;
    BRAIN.postSynaptic["MVL11"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MVL14"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MVR11"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MVR14"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["VB5"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["VB5"] = function () {
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DD3"][BRAIN.nextState] += 27;
    BRAIN.postSynaptic["MVL13"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["MVL14"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["MVR13"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["MVR14"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["VB2"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VB4"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VB6"][BRAIN.nextState] += 8;
  };
  BRAIN.connectome["VB6"] = function () {
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["DA4"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DD4"][BRAIN.nextState] += 30;
    BRAIN.postSynaptic["MVL15"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["MVL16"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["MVR15"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["MVR16"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["MVULVA"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["VA8"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VB5"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VB7"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD6"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD7"][BRAIN.nextState] += 8;
  };
  BRAIN.connectome["VB7"] = function () {
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["DD4"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MVL15"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MVR15"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["VB2"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["VB8"] = function () {
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["DD5"][BRAIN.nextState] += 30;
    BRAIN.postSynaptic["MVL17"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MVL18"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MVL20"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MVR17"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MVR18"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MVR20"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["VA8"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["VA9"][BRAIN.nextState] += 9;
    BRAIN.postSynaptic["VA9"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VB9"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["VD10"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD9"][BRAIN.nextState] += 10;
  };
  BRAIN.connectome["VB9"] = function () {
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["DD5"][BRAIN.nextState] += 8;
    BRAIN.postSynaptic["DVB"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVL17"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["MVL20"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["MVR17"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["MVR20"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["PVCL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VA8"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["VA9"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["VB8"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VB8"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["VD10"][BRAIN.nextState] += 5;
  };
  BRAIN.connectome["VB10"] = function () {
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVKL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DD6"][BRAIN.nextState] += 9;
    BRAIN.postSynaptic["MVL19"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MVL20"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MVR19"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MVR20"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["PVCL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVT"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD11"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD12"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["VB11"] = function () {
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DD6"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["MVL21"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MVL22"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MVL23"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MVR21"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MVR22"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MVR23"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MVR24"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["PVCR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VA12"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["VC1"] = function () {
    BRAIN.postSynaptic["AVL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["DD1"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["DD2"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["DD3"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["DVC"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVULVA"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["PVT"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VC2"][BRAIN.nextState] += 9;
    BRAIN.postSynaptic["VC3"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["VD1"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["VD2"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD3"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD4"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VD5"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["VD6"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["VC2"] = function () {
    BRAIN.postSynaptic["DB4"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DD1"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["DD2"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["DD3"][BRAIN.nextState] += 9;
    BRAIN.postSynaptic["DVC"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVULVA"][BRAIN.nextState] += 10;
    BRAIN.postSynaptic["PVCR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVQR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVT"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VC1"][BRAIN.nextState] += 10;
    BRAIN.postSynaptic["VC3"][BRAIN.nextState] += 6;
    BRAIN.postSynaptic["VD1"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VD2"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VD4"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["VD5"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["VD6"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["VC3"] = function () {
    BRAIN.postSynaptic["AVL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DD1"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["DD2"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["DD3"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["DD4"][BRAIN.nextState] += 13;
    BRAIN.postSynaptic["DVC"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["HSNR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVULVA"][BRAIN.nextState] += 11;
    BRAIN.postSynaptic["PVNR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVPR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVQR"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["VC1"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["VC2"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["VC4"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VC5"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VD1"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD2"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD3"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD4"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VD5"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["VD6"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["VD7"][BRAIN.nextState] += 5;
  };
  BRAIN.connectome["VC4"] = function () {
    BRAIN.postSynaptic["AVBL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVFR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVHR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVULVA"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["VC1"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VC3"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["VC5"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["VC5"] = function () {
    BRAIN.postSynaptic["AVFL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["AVFR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DVC"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["HSNL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVULVA"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["OLLR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVT"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["URBL"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["VC3"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["VC4"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["VC6"] = function () {
    BRAIN.postSynaptic["MVULVA"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["VD1"] = function () {
    BRAIN.postSynaptic["DD1"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["DVC"][BRAIN.nextState] += 5;
    BRAIN.postSynaptic["MVL05"][BRAIN.nextState] += -5;
    BRAIN.postSynaptic["MVL08"][BRAIN.nextState] += -5;
    BRAIN.postSynaptic["MVR05"][BRAIN.nextState] += -5;
    BRAIN.postSynaptic["MVR08"][BRAIN.nextState] += -5;
    BRAIN.postSynaptic["RIFL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["RIGL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["SMDDR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VA1"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VA2"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VC1"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD2"][BRAIN.nextState] += 7;
  };
  BRAIN.connectome["VD2"] = function () {
    BRAIN.postSynaptic["AS1"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DD1"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["MVL07"][BRAIN.nextState] += -7;
    BRAIN.postSynaptic["MVL10"][BRAIN.nextState] += -7;
    BRAIN.postSynaptic["MVR07"][BRAIN.nextState] += -7;
    BRAIN.postSynaptic["MVR10"][BRAIN.nextState] += -7;
    BRAIN.postSynaptic["VA2"][BRAIN.nextState] += 9;
    BRAIN.postSynaptic["VB2"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["VD1"][BRAIN.nextState] += 7;
    BRAIN.postSynaptic["VD3"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["VD3"] = function () {
    BRAIN.postSynaptic["MVL09"][BRAIN.nextState] += -7;
    BRAIN.postSynaptic["MVL12"][BRAIN.nextState] += -9;
    BRAIN.postSynaptic["MVR09"][BRAIN.nextState] += -7;
    BRAIN.postSynaptic["MVR12"][BRAIN.nextState] += -7;
    BRAIN.postSynaptic["PVPL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VA3"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VB2"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VD2"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VD4"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["VD4"] = function () {
    BRAIN.postSynaptic["DD2"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MVL11"][BRAIN.nextState] += -9;
    BRAIN.postSynaptic["MVL12"][BRAIN.nextState] += -9;
    BRAIN.postSynaptic["MVR11"][BRAIN.nextState] += -9;
    BRAIN.postSynaptic["MVR12"][BRAIN.nextState] += -9;
    BRAIN.postSynaptic["PVPR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD3"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD5"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["VD5"] = function () {
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVL14"][BRAIN.nextState] += -17;
    BRAIN.postSynaptic["MVR14"][BRAIN.nextState] += -17;
    BRAIN.postSynaptic["PVPR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VA5"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VB4"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VD4"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD6"][BRAIN.nextState] += 2;
  };
  BRAIN.connectome["VD6"] = function () {
    BRAIN.postSynaptic["AVAL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["MVL13"][BRAIN.nextState] += -7;
    BRAIN.postSynaptic["MVL14"][BRAIN.nextState] += -7;
    BRAIN.postSynaptic["MVL16"][BRAIN.nextState] += -7;
    BRAIN.postSynaptic["MVR13"][BRAIN.nextState] += -7;
    BRAIN.postSynaptic["MVR14"][BRAIN.nextState] += -7;
    BRAIN.postSynaptic["MVR16"][BRAIN.nextState] += -7;
    BRAIN.postSynaptic["VA6"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VB5"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VD5"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VD7"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["VD7"] = function () {
    BRAIN.postSynaptic["MVL15"][BRAIN.nextState] += -7;
    BRAIN.postSynaptic["MVL16"][BRAIN.nextState] += -7;
    BRAIN.postSynaptic["MVR15"][BRAIN.nextState] += -7;
    BRAIN.postSynaptic["MVR16"][BRAIN.nextState] += -7;
    BRAIN.postSynaptic["MVULVA"][BRAIN.nextState] += -15;
    BRAIN.postSynaptic["VA9"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD6"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["VD8"] = function () {
    BRAIN.postSynaptic["DD4"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MVL15"][BRAIN.nextState] += -18;
    BRAIN.postSynaptic["MVR15"][BRAIN.nextState] += -18;
    BRAIN.postSynaptic["VA8"][BRAIN.nextState] += 5;
  };
  BRAIN.connectome["VD9"] = function () {
    BRAIN.postSynaptic["MVL17"][BRAIN.nextState] += -10;
    BRAIN.postSynaptic["MVL18"][BRAIN.nextState] += -10;
    BRAIN.postSynaptic["MVR17"][BRAIN.nextState] += -10;
    BRAIN.postSynaptic["MVR18"][BRAIN.nextState] += -10;
    BRAIN.postSynaptic["PDER"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VD10"][BRAIN.nextState] += 5;
  };
  BRAIN.connectome["VD10"] = function () {
    BRAIN.postSynaptic["AVBR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["DD5"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["DVC"][BRAIN.nextState] += 4;
    BRAIN.postSynaptic["MVL17"][BRAIN.nextState] += -9;
    BRAIN.postSynaptic["MVL20"][BRAIN.nextState] += -9;
    BRAIN.postSynaptic["MVR17"][BRAIN.nextState] += -9;
    BRAIN.postSynaptic["MVR20"][BRAIN.nextState] += -9;
    BRAIN.postSynaptic["VB9"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VD9"][BRAIN.nextState] += 5;
  };
  BRAIN.connectome["VD11"] = function () {
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MVL19"][BRAIN.nextState] += -9;
    BRAIN.postSynaptic["MVL20"][BRAIN.nextState] += -9;
    BRAIN.postSynaptic["MVR19"][BRAIN.nextState] += -9;
    BRAIN.postSynaptic["MVR20"][BRAIN.nextState] += -9;
    BRAIN.postSynaptic["VA11"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VB10"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["VD12"] = function () {
    BRAIN.postSynaptic["MVL19"][BRAIN.nextState] += -5;
    BRAIN.postSynaptic["MVL21"][BRAIN.nextState] += -5;
    BRAIN.postSynaptic["MVR19"][BRAIN.nextState] += -5;
    BRAIN.postSynaptic["MVR22"][BRAIN.nextState] += -5;
    BRAIN.postSynaptic["VA11"][BRAIN.nextState] += 3;
    BRAIN.postSynaptic["VA12"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VB10"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["VB11"][BRAIN.nextState] += 1;
  };
  BRAIN.connectome["VD13"] = function () {
    BRAIN.postSynaptic["AVAR"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["MVL21"][BRAIN.nextState] += -9;
    BRAIN.postSynaptic["MVL22"][BRAIN.nextState] += -9;
    BRAIN.postSynaptic["MVL23"][BRAIN.nextState] += -9;
    BRAIN.postSynaptic["MVR21"][BRAIN.nextState] += -9;
    BRAIN.postSynaptic["MVR22"][BRAIN.nextState] += -9;
    BRAIN.postSynaptic["MVR23"][BRAIN.nextState] += -9;
    BRAIN.postSynaptic["MVR24"][BRAIN.nextState] += -9;
    BRAIN.postSynaptic["PVCL"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVCR"][BRAIN.nextState] += 1;
    BRAIN.postSynaptic["PVPL"][BRAIN.nextState] += 2;
    BRAIN.postSynaptic["VA12"][BRAIN.nextState] += 1;
  };
};

BRAIN.update = function () {
  if (BRAIN.stimulateHungerNeurons) {
    BRAIN.dendriteAccumulate("RIML");
    BRAIN.dendriteAccumulate("RIMR");
    BRAIN.dendriteAccumulate("RICL");
    BRAIN.dendriteAccumulate("RICR");
    BRAIN.runconnectome();
  }
  if (BRAIN.stimulateNoseTouchNeurons) {
    BRAIN.dendriteAccumulate("FLPR");
    BRAIN.dendriteAccumulate("FLPL");
    BRAIN.dendriteAccumulate("ASHL");
    BRAIN.dendriteAccumulate("ASHR");
    BRAIN.dendriteAccumulate("IL1VL");
    BRAIN.dendriteAccumulate("IL1VR");
    BRAIN.dendriteAccumulate("OLQDL");
    BRAIN.dendriteAccumulate("OLQDR");
    BRAIN.dendriteAccumulate("OLQVR");
    BRAIN.dendriteAccumulate("OLQVL");
    BRAIN.runconnectome();
  }
  if (BRAIN.stimulateFoodSenseNeurons) {
    BRAIN.dendriteAccumulate("ADFL");
    BRAIN.dendriteAccumulate("ADFR");
    BRAIN.dendriteAccumulate("ASGR");
    BRAIN.dendriteAccumulate("ASGL");
    BRAIN.dendriteAccumulate("ASIL");
    BRAIN.dendriteAccumulate("ASIR");
    BRAIN.dendriteAccumulate("ASJR");
    BRAIN.dendriteAccumulate("ASJL");
    BRAIN.runconnectome();
  }

  //RIML RIMR RICL RICR hunger neurons
  //PVDL PVDR nociceptors
  //ASEL ASER gustatory neurons
};

BRAIN.runconnectome = function () {
  for (var ps in BRAIN.postSynaptic) {
    /* Muscles cannot fire, make sure they don't */
    if (
      BRAIN.muscles.indexOf(ps.substring(0, 3)) == -1 &&
      BRAIN.postSynaptic[ps][BRAIN.thisState] > BRAIN.fireThreshold
    ) {
      BRAIN.fireNeuron(ps);
    }
  }

  BRAIN.motorcontrol();

  for (var ps in BRAIN.postSynaptic) {
    BRAIN.postSynaptic[ps][BRAIN.thisState] =
      BRAIN.postSynaptic[ps][BRAIN.nextState];
  }

  var temp = BRAIN.thisState;
  BRAIN.thisState = BRAIN.nextState;
  BRAIN.nextState = temp;
};

BRAIN.fireNeuron = function (fneuron) {
  /* The threshold has been exceeded and we fire the neurite */
  if (fneuron !== "MVULVA") {
    BRAIN.connectome[fneuron]();
    BRAIN.postSynaptic[fneuron][BRAIN.nextState] = 0;
  }
};

BRAIN.dendriteAccumulate = function (dneuron) {
  BRAIN.connectome[dneuron]();
};

BRAIN.motorcontrol = function () {
  /* accumulate left and right muscles and the accumulated values are
       used to move the left and right motors of the robot */

  BRAIN.accumleft = 0;
  BRAIN.accumright = 0;

  for (var m = 0; m < BRAIN.muscleList.length; m++) {
    var muscleName = BRAIN.muscleList[m];

    if (BRAIN.mLeft.indexOf(muscleName) != -1) {
      BRAIN.accumleft += BRAIN.postSynaptic[muscleName][BRAIN.nextState];
      BRAIN.postSynaptic[muscleName][BRAIN.nextState] = 0;
    } else if (BRAIN.mRight.indexOf(muscleName) != -1) {
      BRAIN.accumright += BRAIN.postSynaptic[muscleName][BRAIN.nextState];
      BRAIN.postSynaptic[muscleName][BRAIN.nextState] = 0;
    }
  }
};
