export default `
type Query {
  question(id: Int!): Question,
  questionSearch(userId: Int!, query: String, isEnabled:Boolean, limit: Int, order: String): [Question!]!,
}

type Question {
  id: Int!,
  question: String!,
  userId: Int!,
  name: String!,
  isEnabled: Boolean!,
  options(limit: Int, order: String): [Option!]!,
  createdAt: String!,
  updatedAt: String!,
}

type Option {
  id: Int!,
  option: String!,
  questionId: Int!,
  question: Question!,
  votes(limit: Int, order: String): [Vote!]!,
  createdAt: String!,
  updatedAt: String!,
}

type Vote {
  id: Int!,
  userId: Int!,
  name: String!,
  optionId: Int!,
  option: Option!,
  createdAt: String!,
  updatedAt: String!,
}

type Mutation {
  createQuestion(userId: Int!, name: String!, question: String!): Question!,
  createOption(questionId: Int!, option: String!): Option!,
  createVote(optionId: Int!, userId: Int!, name: String!): Vote!,

  updateQuestion(id: Int!, question: String, isEnabled: Boolean): [Boolean!],
  updateOption(id: Int!, option: String!): [Boolean!],

  deleteOption(id: Int!): Boolean!,
  deleteVote(id: Int!): Boolean!,
}
`;
