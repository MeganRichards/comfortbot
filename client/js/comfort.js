$( document ).ready(function() {
	
	// needs to be in celsius
    FindSaturatedVaporPressureTorr = function(T) {
    	// Helper function for pierceSET calculates SAturated Vapor Pressure (Torr) at Temperature T (*C)
    	return Math.exp(18.6686 - 4030.183/(T + 235.0));
    }
    
    pierceSet = function(TA, TR, VEL, RH, MET, CLO, WME, PATM) {
    	// Input variables - TA (air temperature): *C, TR (mean radiant temperature): *C, VEL (air velocity): m/s,
    	// RH (relative humidity): %, MET: met unit, CLO: clo unit, WME (External work): W/m^2, PATM (atmospheric pressure): kPa
    	var KCLO = 0.25;
    	var BODYWEIGHT = 69.9;	// kg
    	var BODYSURFACEAREA = 1.8258;		// m^2
    	var METFACTOR= 58.2;		// W/m^2
    	var SBC = 0.000000056697;		// Stefan-Boltzmann constant W/m^2K4)
    	var CSW = 170.0;
    	var CDIL = 120.0;
    	var CSTR = 0.5;
    	var LTIME = 60.0;
    
    	var VaporPressure = RH * FindSaturatedVaporPressureTorr(TA) / 100.0;
    	var AirVelocity = Math.max(VEL, 0.1);
    	var TempSkinNeutral = 33.7;
    	var TempCoreNeutral = 36.49;
    	var TempBodyNeutral = 36.49;
    	var SkinBloodFlowNeutral = 6.3;
    	var TempSkin = TempSkinNeutral;
    	var TempCore = TempCoreNeutral;
    	var SkinBloodFlow = SkinBloodFlowNeutral;
    	var MSHIV = 0.0;
    	var ALFA = 0.1;
    	var ESK = 0.1 * MET;
    	var PressureInAtmospheres = PATM * 0.009869;
    	var RCL = 0.155 * CLO;
    	var FACL = 1.0 + 0.15 * CLO;
    	var LR = 2.2 / PressureInAtmospheres;
    	var RM = MET * METFACTOR;
    	var M = MET * METFACTOR;
    	
    	if (CLO <= 0) {
    		var WCRIT = 0.38 * Math.pow(AirVelocity, -0.29);
    		var ICL = 1.0;
    	}
    	else {
    		var WCRIT = 0.59 * Math.pow(AirVelocity, -0.08);
    		var ICL = 0.45;
    	}
    	var CHC	= 3.0 * Math.pow(PressureInAtmospheres, 0.53);
    	var CHCV = 8.600001 * Math.pow((AirVelocity * PressureInAtmospheres), 0.53);
    	var CHC = Math.max(CHC, CHCV);
    	var CHR = 4.7;
    	var CTC = CHR + CHC;
    	var RA = 1.0 / (FACL * CTC);
    	var TOP = (CHR * TR + CHC * TA) / CTC;
    	var TCL = TOP + (TempSkin - TOP) / (CTC * (RA + RCL));
    	// TCL and CHR are solved iteratively using: H(Tsk - TOP) = CTC(TCL - TOP),
    	// where H = 1  (RA + RCL) and RA = 1 / FACL * CTC
    	var TCL_OLD = TCL;
    	var flag = true;
    	var DRY, HFCS, ERES, CRES, SCR, SSK, TCSK, TCCR, DTSK, DTCR, TB, SKSIG, WARMS, COLDS, CRSIG, WARMC, COLDC, BDSIG, WARMB, COLDB, REGSW, ERSW, REA, RECL, EMAX, PRSW, PWET, EDIF, ESK;
    	
    	for (var TIM = 1; TIM <= LTIME; TIM++) {
    		do {
    			if (flag) {
    				TCL_OLD = TCL;
    				CHR = 4.0 * SBC * Math.pow(((TCL + TR) / 2.0 + 273.15), 3.0) * 0.72;
    				CTC = CHR + CHC;
    				RA = 1.0  /(FACL * CTC);
    				TOP = (CHR * TR + CHC * TA) / CTC;
    			}
    			TCL = (RA * TempSkin + RCL * TOP) / (RA + RCL);
    			flag = true;
    		} while (Math.abs(TCL - TCL_OLD) > 0.01);
    		flag = false;
    		DRY = (TempSkin - TOP) / (RA + RCL);
    		HFCS = (TempCore - TempSkin) * (5.28 + 1.163 * SkinBloodFlow);
    		ERES = 0.0023 * M * (44.0 - VaporPressure);
    		CRES = 0.0014 * M * (34.0 - TA);
    		SCR = M - HFCS - ERES - CRES - WME;
    		SSK = HFCS - DRY - ESK;
    		TCSK = 0.97 * ALFA * BODYWEIGHT;
    		TCCR = 0.97 * (1 - ALFA) * BODYWEIGHT;
    		DTSK = (SSK * BODYSURFACEAREA) / (TCSK * 60.0);
    		DTCR = SCR * BODYSURFACEAREA / (TCCR * 60.0);
    		
            TempSkin = TempSkin + DTSK;
            TempCore = TempCore + DTCR;
            TB = ALFA * TempSkin + (1 - ALFA ) * TempCore;
            SKSIG = TempSkin - TempSkinNeutral;
            WARMS = (SKSIG > 0) * SKSIG;
            COLDS = ((-1.0 * SKSIG > 0) * (-1.0 * SKSIG));
            CRSIG = (TempCore - TempCoreNeutral);
            WARMC = (CRSIG > 0) * CRSIG;
            COLDC = ((-1.0 * CRSIG) > 0) * (-1.0 * CRSIG);
            BDSIG = TB - TempBodyNeutral;
            WARMB = (BDSIG > 0) * BDSIG;
            SkinBloodFlow = (SkinBloodFlowNeutral + CDIL * WARMC)/(1 + CSTR * COLDS);
            SkinBloodFlow = Math.max(0.5, Math.min(90.0, SkinBloodFlow));
            REGSW = CSW * WARMB * Math.exp(WARMS/10.7);
            REGSW = Math.min(REGSW, 500.0);
            var ERSW = 0.68 * REGSW;
            var REA = 1.0/(LR * FACL * CHC);                //Evaporative resistance of air layer
            var RECL = RCL/(LR * ICL);                      //Evaporative resistance of clothing (icl=.45)
            var EMAX = (FindSaturatedVaporPressureTorr(TempSkin) - VaporPressure)/(REA + RECL);
            var PRSW = ERSW/EMAX;
            var PWET = 0.06 + 0.94 * PRSW;
            var EDIF = PWET * EMAX - ERSW;
            var ESK = ERSW + EDIF;
            if (PWET > WCRIT) {
                PWET = WCRIT;
                PRSW = WCRIT/0.94;
                ERSW = PRSW * EMAX;
                EDIF = 0.06 * (1.00 - PRSW) * EMAX;
                ESK = ERSW + EDIF;
            }
        	if(EMAX < 0) {
                EDIF = 0;
                ERSW = 0;
                PWET = WCRIT;
                PRSW = WCRIT;
                ESK = EMAX;
              }
              ESK = ERSW + EDIF;
              MSHIV = 19.4 * COLDS * COLDC;
              M = RM + MSHIV;
              ALFA = 0.0417737 + 0.7451833/(SkinBloodFlow + 0.595417);
		}											                    //End iteration
        var HSK = DRY + ESK;							// Total heat loss from skin
        var RN = M - WME;								//Net metabolic heat production
        var ECOMF = 0.42 * (RN - (1 * METFACTOR));
        if(ECOMF < 0.0) ECOMF = 0.0;					    //From Franger
		EMAX = EMAX * WCRIT;
		var W = PWET;
		var PSSK = FindSaturatedVaporPressureTorr(TempSkin);
		var CHRS = CHR;								    //Definition of ASHRAE standard environment
													//... denoted "S"
		if(MET < 0.85) {
		var CHCS = 3.0;
		} else {
			var CHCS = 5.66 * Math.pow(((MET - 0.85)), 0.39);
			CHCS = Math.max(CHCS, 3.0);
		}
		var CTCS = CHCS + CHRS;
		var RCLOS = 1.52/((MET - WME/METFACTOR) + 0.6944) - 0.1835;
		var RCLS = 0.155 * RCLOS;
		var FACLS = 1.0 + KCLO * RCLOS;
		var FCLS = 1.0/(1.0 + 0.155 * FACLS * CTCS * RCLOS);
		var IMS = 0.45;
		var ICLS = IMS * CHCS/CTCS * (1 - FCLS)/(CHCS/CTCS - FCLS * IMS);
		var RAS = 1.0/(FACLS * CTCS);
		var REAS = 1.0/(LR * FACLS * CHCS);
		var RECLS = RCLS/(LR * ICLS);
		var HD_S = 1.0/(RAS + RCLS);
		var HE_S = 1.0/(REAS + RECLS);     
	
		//SET determined using Newton's iterative solution
		var DELTA = .0001;
		var dx = 100.0;
		var SET, ERR1, ERR2;
		var SET_OLD = TempSkin - HSK/HD_S;			    //Lower bound for SET
			
		while (Math.abs(dx) > 0.1) {
			ERR1 = (HSK - HD_S * (TempSkin - SET_OLD) - W * HE_S * (PSSK - 0.5 * FindSaturatedVaporPressureTorr(SET_OLD)));
			ERR2 = (HSK - HD_S * (TempSkin - (SET_OLD + DELTA)) - W * HE_S * (PSSK - 0.5 * FindSaturatedVaporPressureTorr((SET_OLD + DELTA))));
			SET = SET_OLD - DELTA * ERR1/(ERR2 - ERR1);
			dx = SET - SET_OLD;
			SET_OLD = SET;
		}
		return SET;
	}
    
    // just a test function, ignore it
	$('#comfort_vals').submit(function(event) {
		event.preventDefault();
		// get all the inputs into an array.
		var $inputs = $('#comfort_vals :input');

		// not sure if you wanted this, but I thought I'd add it.
		// get an associative array of just the values.
		var values = {};
		$inputs.each(function() {
			console.log(this.name + $(this).val());
			values[this.name] = parseFloat($(this).val());
		});

		// calculate comfort
		var result = pierceSet(values["TA"], values["TR"], values["VEL"], values["RH"], values["MET"], values["CLO"], values["WME"], values["PATM"]);
		$('.result').html("Comfort level: " + result);
	});
	//var result = pierceSet(28.0, 28.0, 1.0, 50.0, 1.1, 0.8, 65, 84.0);	// ideal values for typing
	// pierceSet(temp, rad_temp, velocity, rh, met, clo, wme, patm)
    var result = pierceSet(10.0, 25.0, 0.15, 50.0, 1, 0.5, 40, 101.0);
	$('.result').html("Comfort level: " + result);

});
