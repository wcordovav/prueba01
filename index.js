import Persons from './includes/personas.js';
import {ApolloServer, AuthenticationError, gql, UserInputError} from 'apollo-server';
import connectDB from './config/db.js';
import Person from './models/Person.js';
import User from './models/User.js'
import jwt from 'jsonwebtoken';

const SECRET_JWT = 'eosm10j12ehañlskdj019hjd021jdisajd192jd01ijdimknlañsdghuu1b3h3hfu3hfu3h';

connectDB();

const typeDefinitions = gql`

  enum YesNo{
    YES
    NO
  }

  type Address {
    street: String!
    city: String!
  }

  type Person {
    name : String!
    phone: String
    street: String!
    city: String!
    address: String!
    direccion : Address!
    id : ID!
  }

  type User{
    username: String!
    friends: [Person]!
    id: ID!
  }

  type Token{
    value: String!
  }

  type Query{
    personCount: Int!
    allPersons(phone: YesNo): [Person]!
    findPerson(name: String!): Person
    me: User
  }

  type Mutation{
    addPerson(
      name: String!
      phone: String
      street: String!
      city: String!
    ): Person

    editNumber(
      name: String!
      phone: String!
    ): Person

    createUser(
      username: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token
    addAsFriend(
      name: String!
    ): User
  }
`;

const resolvers = {
  Query: {
    personCount: () =>  Person.collection.countDocuments(),
    allPersons: async(root, args) => {
      return await Person.find({})
    },
    findPerson: async(root, args) => {
      const {name} = args;
      return await Person.findOne({name})
    },
    me: (root, args, context) =>{
      return context.currentUser;
    }
  },
  Mutation: {
    addPerson: async(root, args, context) => {

      const {currentUser} = context;
      if(!currentUser) throw new AuthenticationError('not logged')

      const person = new Person({...args})

      try {
        const newPerson =  await person.save();
        currentUser.friends = currentUser.friends.concat(person)
        await currentUser.save();
        return newPerson;
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args
        })
      }

      
    },
    editNumber: async(root, args) => {
     const person = await Person.findOne({name: args.name});
    
     if(!person) return null;
     
     const editedPerson =  await Person.findByIdAndUpdate(person._id, {phone: args.phone},{new : true})
    //  console.log(editedPerson) 
      return  editedPerson;
    },
    createUser: async(root, args) =>{
      const user = new User({username: args.username})

      return await user.save().catch(error => {
        throw new UserInputError(error.message, {
          invalidArgs: args
        })
      });
    },
    login: async(root, args) =>{
      const user = await User.findOne({username: args.username})

      if (!user || args.password !== 'secret') {
        throw new UserInputError('wrong credentials')
      }

      const userForToken = {
        username: user.username,
        id: user._id
      }

      return {
        value: jwt.sign(userForToken, SECRET_JWT)
      }
    },
    addAsFriend: async(root, args, {currentUser})=>{
      if(!currentUser) throw new AuthenticationError('not logged')

      const person = await Person.findOne({name: args.name})
      // console.log(person)

      if(!person) return null;

      const nonFriendlyAlready = person => {
        const idArray= currentUser.friends
        .map(p =>p.id);
        // console.log(idArray)
        // console.log(idArray.includes(person.id))

        return idArray.includes(person.id)
      }

      if (!nonFriendlyAlready(person)) {
        currentUser.friends = currentUser.friends.concat(person)
        await currentUser.save()
      }

      return currentUser;

    }
  },
  Person: {
    address: (root) =>{
      return `${root.street}, ${root.city}`
    },
    direccion : (root)=> {
      return {
        street: root.street,
        city: root.city
      }
    }
  }
}

const server = new ApolloServer({
  typeDefs : typeDefinitions,
  resolvers,
  context: async ({req}) => {
    const auth = req ? req.headers.authorization : null;
    if(auth && auth.toLowerCase().startsWith('bearer ')){
      const token = auth.substring(7)
      const {id} = jwt.verify(token, SECRET_JWT);
      const currentUser = await User.findById(id).populate('friends');
      // console.log(currentUser)
      return {currentUser}
    }
  }
});

server.listen().then(({url})=> 
  console.log(`server corriendo en ${url}`)
);