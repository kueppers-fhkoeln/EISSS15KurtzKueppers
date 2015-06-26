package com.teamdrive.example;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Utility {
	private static Pattern pattern;
	private static Matcher matcher;
	//Email Pattern
	private static final String EMAIL_PATTERN =
			"^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@"
			+ "[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$";

	/**
	 * Überprüft, ob die E-Mail Adresse richtig ist
	 *return wenn email richtig ist dann true, sonst false
	 */
	public static boolean validate(String email) {
		pattern = Pattern.compile(EMAIL_PATTERN);
		matcher = pattern.matcher(email);
		return matcher.matches();

	}
	/**
	 * Überprüft, ob der String nicht == 0 ist
	 * return wenn != 0 dann true, wenn == 0 dann false
	 */
	public static boolean isNotNull(String txt){
		return txt!=null && txt.trim().length()>0 ? true: false;
	}
}
