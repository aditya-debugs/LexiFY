/**
 * Translation dictionary for quiz content
 * Maps question/answer keys to actual text in different languages
 *
 * NOTE: In a production app, you would integrate with a real translation API
 * or use a comprehensive i18n library. This is a simplified example.
 */

const translations = {
  // English translations
  English: {
    // Question translations
    greetings_basic: "What is the word for 'Hello'?",
    colors_red: "What color is an apple?",
    numbers_one: "What is the first number?",
    family_mother: "What do you call your female parent?",
    days_monday: "What is the first day of the week?",
    time_what_time: "How do you ask for the current time?",
    food_hungry: "How do you express that you need food?",
    direction_left: "Which direction is opposite to right?",
    weather_sunny: "What is the weather when the sky is clear?",
    idiom_break_ice: "What idiom means to start a conversation?",
    formal_pleased_meet: "What is a formal greeting when meeting someone?",

    // Answer translations
    hello: "Hello",
    goodbye: "Goodbye",
    thank_you: "Thank you",
    please: "Please",
    red: "Red",
    blue: "Blue",
    green: "Green",
    yellow: "Yellow",
    one: "One",
    two: "Two",
    three: "Three",
    four: "Four",
    mother: "Mother",
    father: "Father",
    brother: "Brother",
    sister: "Sister",
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    what_time: "What time is it?",
    where_are_you: "Where are you?",
    how_are_you: "How are you?",
    what_is_name: "What is your name?",
    i_am_hungry: "I am hungry",
    i_am_tired: "I am tired",
    i_am_happy: "I am happy",
    i_am_cold: "I am cold",
    turn_left: "Turn left",
    turn_right: "Turn right",
    go_straight: "Go straight",
    stop: "Stop",
    sunny: "Sunny",
    rainy: "Rainy",
    cloudy: "Cloudy",
    snowy: "Snowy",
    break_ice: "Break the ice",
    spill_beans: "Spill the beans",
    piece_cake: "Piece of cake",
    hit_books: "Hit the books",
    pleased_to_meet: "Pleased to meet you",
    whats_up: "What's up",
    hey_there: "Hey there",
    see_you: "See you later",
  },

  // Spanish translations
  Spanish: {
    greetings_basic: "¿Cuál es la palabra para 'Hola'?",
    colors_red: "¿De qué color es una manzana?",
    numbers_one: "¿Cuál es el primer número?",
    family_mother: "¿Cómo llamas a tu padre femenino?",
    days_monday: "¿Cuál es el primer día de la semana?",
    time_what_time: "¿Cómo preguntas la hora actual?",
    food_hungry: "¿Cómo expresas que necesitas comida?",
    direction_left: "¿Qué dirección es opuesta a la derecha?",
    weather_sunny: "¿Cómo está el clima cuando el cielo está despejado?",
    idiom_break_ice: "¿Qué expresión significa comenzar una conversación?",
    formal_pleased_meet: "¿Cuál es un saludo formal al conocer a alguien?",

    hello: "Hola",
    goodbye: "Adiós",
    thank_you: "Gracias",
    please: "Por favor",
    red: "Rojo",
    blue: "Azul",
    green: "Verde",
    yellow: "Amarillo",
    one: "Uno",
    two: "Dos",
    three: "Tres",
    four: "Cuatro",
    mother: "Madre",
    father: "Padre",
    brother: "Hermano",
    sister: "Hermana",
    monday: "Lunes",
    tuesday: "Martes",
    wednesday: "Miércoles",
    thursday: "Jueves",
    what_time: "¿Qué hora es?",
    where_are_you: "¿Dónde estás?",
    how_are_you: "¿Cómo estás?",
    what_is_name: "¿Cómo te llamas?",
    i_am_hungry: "Tengo hambre",
    i_am_tired: "Estoy cansado",
    i_am_happy: "Estoy feliz",
    i_am_cold: "Tengo frío",
    turn_left: "Gira a la izquierda",
    turn_right: "Gira a la derecha",
    go_straight: "Sigue recto",
    stop: "Para",
    sunny: "Soleado",
    rainy: "Lluvioso",
    cloudy: "Nublado",
    snowy: "Nevado",
    break_ice: "Romper el hielo",
    spill_beans: "Soltar la sopa",
    piece_cake: "Pan comido",
    hit_books: "Ponerse a estudiar",
    pleased_to_meet: "Encantado de conocerte",
    whats_up: "¿Qué pasa?",
    hey_there: "Hola",
    see_you: "Hasta luego",
  },

  // French translations
  French: {
    greetings_basic: "Quel est le mot pour 'Bonjour'?",
    colors_red: "De quelle couleur est une pomme?",
    numbers_one: "Quel est le premier nombre?",
    family_mother: "Comment appelez-vous votre parent féminin?",
    days_monday: "Quel est le premier jour de la semaine?",
    time_what_time: "Comment demandez-vous l'heure actuelle?",
    food_hungry: "Comment exprimez-vous que vous avez besoin de nourriture?",
    direction_left: "Quelle direction est opposée à droite?",
    weather_sunny: "Quel est le temps quand le ciel est dégagé?",
    idiom_break_ice: "Quelle expression signifie commencer une conversation?",
    formal_pleased_meet:
      "Quelle est une salutation formelle lors d'une rencontre?",

    hello: "Bonjour",
    goodbye: "Au revoir",
    thank_you: "Merci",
    please: "S'il vous plaît",
    red: "Rouge",
    blue: "Bleu",
    green: "Vert",
    yellow: "Jaune",
    one: "Un",
    two: "Deux",
    three: "Trois",
    four: "Quatre",
    mother: "Mère",
    father: "Père",
    brother: "Frère",
    sister: "Sœur",
    monday: "Lundi",
    tuesday: "Mardi",
    wednesday: "Mercredi",
    thursday: "Jeudi",
    what_time: "Quelle heure est-il?",
    where_are_you: "Où êtes-vous?",
    how_are_you: "Comment allez-vous?",
    what_is_name: "Comment vous appelez-vous?",
    i_am_hungry: "J'ai faim",
    i_am_tired: "Je suis fatigué",
    i_am_happy: "Je suis heureux",
    i_am_cold: "J'ai froid",
    turn_left: "Tournez à gauche",
    turn_right: "Tournez à droite",
    go_straight: "Allez tout droit",
    stop: "Arrêtez",
    sunny: "Ensoleillé",
    rainy: "Pluvieux",
    cloudy: "Nuageux",
    snowy: "Neigeux",
    break_ice: "Briser la glace",
    spill_beans: "Vendre la mèche",
    piece_cake: "C'est du gâteau",
    hit_books: "Bûcher",
    pleased_to_meet: "Enchanté de vous rencontrer",
    whats_up: "Quoi de neuf?",
    hey_there: "Salut",
    see_you: "À bientôt",
  },

  // German translations
  German: {
    greetings_basic: "Was ist das Wort für 'Hallo'?",
    colors_red: "Welche Farbe hat ein Apfel?",
    numbers_one: "Was ist die erste Zahl?",
    family_mother: "Wie nennt man den weiblichen Elternteil?",
    days_monday: "Was ist der erste Tag der Woche?",
    time_what_time: "Wie fragt man nach der aktuellen Zeit?",
    food_hungry: "Wie drückt man aus, dass man Essen braucht?",
    direction_left: "Welche Richtung ist das Gegenteil von rechts?",
    weather_sunny: "Wie ist das Wetter, wenn der Himmel klar ist?",
    idiom_break_ice: "Welche Redewendung bedeutet ein Gespräch beginnen?",
    formal_pleased_meet: "Was ist eine formelle Begrüßung beim Kennenlernen?",

    hello: "Hallo",
    goodbye: "Auf Wiedersehen",
    thank_you: "Danke",
    please: "Bitte",
    red: "Rot",
    blue: "Blau",
    green: "Grün",
    yellow: "Gelb",
    one: "Eins",
    two: "Zwei",
    three: "Drei",
    four: "Vier",
    mother: "Mutter",
    father: "Vater",
    brother: "Bruder",
    sister: "Schwester",
    monday: "Montag",
    tuesday: "Dienstag",
    wednesday: "Mittwoch",
    thursday: "Donnerstag",
    what_time: "Wie spät ist es?",
    where_are_you: "Wo bist du?",
    how_are_you: "Wie geht es dir?",
    what_is_name: "Wie heißt du?",
    i_am_hungry: "Ich habe Hunger",
    i_am_tired: "Ich bin müde",
    i_am_happy: "Ich bin glücklich",
    i_am_cold: "Mir ist kalt",
    turn_left: "Nach links abbiegen",
    turn_right: "Nach rechts abbiegen",
    go_straight: "Geradeaus gehen",
    stop: "Stopp",
    sunny: "Sonnig",
    rainy: "Regnerisch",
    cloudy: "Bewölkt",
    snowy: "Schneereich",
    break_ice: "Das Eis brechen",
    spill_beans: "Die Bohnen verschütten",
    piece_cake: "Ein Kinderspiel",
    hit_books: "Bücher wälzen",
    pleased_to_meet: "Freut mich, Sie kennenzulernen",
    whats_up: "Was ist los?",
    hey_there: "Hey",
    see_you: "Bis später",
  },
};

/**
 * Get translation for a key in the specified language
 * Falls back to English if language or key not found
 */
export function translate(key, language) {
  // Check if we have translations for this language
  if (translations[language] && translations[language][key]) {
    return translations[language][key];
  }

  // Fallback to English
  if (translations.English && translations.English[key]) {
    return translations.English[key];
  }

  // Ultimate fallback - return the key itself
  return key;
}

/**
 * Check if a language is supported
 */
export function isSupportedLanguage(language) {
  return Object.keys(translations).includes(language);
}

/**
 * Get list of all supported languages
 */
export function getSupportedLanguages() {
  return Object.keys(translations);
}

export default translations;
