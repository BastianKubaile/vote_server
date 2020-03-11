module.exports = {
    single_choice_poll: {
        "question": "Wie alt ist die Uni Leipzig?",
        "answers": [
          {
            "name":"Weniger als 500 Jahre",
            "correct_answer": false
          },
          {
            "name":"Mehr als 500 Jahre",
            "correct_answer": true
          }
        ],
        "multipleChoice": false,
        "submittable": false
    },
    multiple_choice_poll: {
      "question": "Wie sollte man sich in einem Feuer verhalten?",
      "answers": [
        {
          "name": "Ruhe bewahren",
          "correct_answer": true
        },
        {
          "name": "Schnell durch das Treppenhaus laufen, auch wenn es verraucht ist",
          "correct_answer": false,
        },
        {
          "name": "Die Tür mit nassen Tüchern abdichten",
          "correct_answer": true
        }
      ],
      "multipleChoice": true,
      "submittable": false
    }
}