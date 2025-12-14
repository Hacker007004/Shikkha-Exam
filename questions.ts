import { Exam } from './types';

export const INITIAL_EXAMS: Exam[] = [
  {
    id: "exam_default_01",
    title: "General Knowledge",
    description: "A basic assessment of web development and general concepts.",
    active: true,
    questions: [
      {
        id: 1,
        text: "What is the primary function of React's useState hook?",
        options: [
          "To handle side effects",
          "To manage local component state",
          "To fetch data from an API",
          "To route between pages"
        ],
        correctAnswer: 1
      },
      {
        id: 2,
        text: "Which method is used to write data securely to a Google Sheet via a script?",
        options: [
          "GET Request",
          "POST Request",
          "DELETE Request",
          "UPDATE Request"
        ],
        correctAnswer: 1
      },
      {
        id: 3,
        text: "In the context of web development, what does 'CSS' stand for?",
        options: [
          "Computer Style Sheets",
          "Creative Style Systems",
          "Cascading Style Sheets",
          "Colorful Style Sheets"
        ],
        correctAnswer: 2
      },
      {
        id: 4,
        text: "Which HTML tag is used to define an unordered list?",
        options: [
          "<ul>",
          "<ol>",
          "<li>",
          "<list>"
        ],
        correctAnswer: 0
      },
      {
        id: 5,
        text: "What is the correct syntax to import a component in React?",
        options: [
          "import Component from 'path'",
          "include Component from 'path'",
          "require Component from 'path'",
          "using Component from 'path'"
        ],
        correctAnswer: 0
      }
    ]
  }
];