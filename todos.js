Router.configure({
  layoutTemplate: 'main'
});

Router.onBeforeAction(function(){
  var currentUser = Meteor.userId();
  if(currentUser){
      this.next();
  } else {
      this.render("login");
  }
}, {
  only: "listPage"
});

Router.route('/', function(){
  this.render('home');
}, {
  name: 'home'
});
Router.route('/register');
Router.route('/login');
Router.route('/list/:_id', function(){
  this.render('listPage', {
    data: function(){
      var currentList = this.params._id;
      var currentUser = Meteor.userId();
      return Lists.findOne({ _id: currentList, createdBy: currentUser });
    }
  });
}, {
  name: 'listPage'
});

Todos = new Meteor.Collection('todos');
Lists = new Meteor.Collection('lists');

if (Meteor.isClient) {
  Template.todosList.helpers({
    'todo': function(){
      var currentList = this._id;
      var currentUser = Meteor.userId();
      return Todos.find({listId: currentList, createdBy: currentUser}, {sort: {createdAt: -1}});
    }
  });

  Template.todoItem.helpers({
    'checked': function(){
      var isCompleted = this.completed;
      if(isCompleted){
        return "checked";
      }
      else {
        return "";
      }
    }
  });

  Template.todosCount.helpers({
    'totalTodos': function(){
      var currentList = this._id;
      return Todos.find({listId: currentList}).count();;
    },
    'completedTodos': function(){
      var currentList = this._id;
      return Todos.find({listId: currentList, completed: true}).count();;
    },
  });

  Template.lists.helpers({
    'list': function(){
      var currentUser = Meteor.userId();
      return Lists.find({createdBy: currentUser}, {sort: {name: 1}});
    }
  });

  Template.todosList.events({
    'submit form': function(event){
      event.preventDefault();
      var todoValue = event.target.todoValue.value;
      var currentList = this._id;
      var currentUser = Meteor.userId();
      Todos.insert({
        title: todoValue,
        completed: false,
        createdAt: new Date(),
        createdBy: currentUser,
        listId: currentList
      });
      event.target.todoValue.value = "";
    },
  });

  Template.todoItem.events({
    'click .delete-todo': function(event){
      event.preventDefault();
      var documentId = this._id;
      var confirm = window.confirm("Sure you want to delete this task?");
      if(confirm){
        Todos.remove({ _id: documentId });
      }
    },
    'keyup .todo-value': function(event){
      if(event.which == 13 || event.which == 27){
        event.target.blur();
      }
      else {
        var todoValue = event.target.value;
        var documentId = this._id;
        Todos.update(
          {_id: documentId},
          {$set: {title: todoValue}}
        );
      }
    },
    'change [type=checkbox]': function(){
      var isCompleted = this.completed;
      if(isCompleted){
        Todos.update({_id: this._id}, {$set: {completed: false}});
        console.log('task marked as incomplete');
      }
      else {
        Todos.update({_id: this._id}, {$set: {completed: true}});
        console.log('task marked as complete');
      }
    },
  });

  Template.addList.events({
    'submit form': function(event){
      event.preventDefault();
      var listName = event.target.listName.value;
      var currentUser = Meteor.userId();
      Lists.insert({
        name: listName,
        createdBy: currentUser
      }, function(error, document){
        Router.go('listPage', {_id: document});
      });
      event.target.listName.value = "";
    }
  });

  Template.register.events({
    'submit form': function(event){
      event.preventDefault();
      var email = event.target.email.value;
      var password = event.target.password.value;
      Accounts.createUser({
        password: password,
        email: email
      }, function(error){
        if(error){
          console.log(error.reason);
        }
        else {
          Router.go('home');
        }
      });
    }
  });

  Template.navigation.events({
    'click .logout': function(event){
      event.preventDefault();
      Meteor.logout();
      Router.go('login');
    }
  });

  Template.login.events({
    'submit form': function(event){
      event.preventDefault();
      var email = event.target.email.value;
      var password = event.target.password.value;
      Meteor.loginWithPassword(email, password, function(error){
        if(error){
          console.log(error.reason);
        }
        else {
          Router.go('home');
        }
      });
    }
  });
}

if (Meteor.isServer) {
 
}
