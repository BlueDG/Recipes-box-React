import React, { Component } from "react";
import AjouterRecette from "./AjouterRecette";
import AdminForm from "./AdminForm";
import Login from "./Login";
import firebase from "firebase/app";
import "firebase/auth";
import base, { firebaseApp } from "../base";

export default class Admin extends Component {
  state = {
    uid: null,
    chef: null
  };

  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.handleAuth({ user });
      }
    });
  }

  handleAuth = async authData => {
    const box = await base.fetch(this.props.pseudo, { context: this });
    if (!box.chef) {
      await base.post(`${this.props.pseudo}/chef`, { data: authData.user.uid });
    }

    this.setState({
      uid: authData.user.uid,
      chef: box.chef || authData.user.uid
    });
  };

  authenticate = () => {
    const authProvider = new firebase.auth.FacebookAuthProvider();
    firebaseApp
      .auth()
      .signInWithPopup(authProvider)
      .then(this.handleAuth);
  };

  logout = async () => {
    await firebase.auth().signOut();
    this.setState({ uid: null });
  };

  render() {
    const {
      recettes,
      ajouterRecette,
      majRecette,
      chargerExemple,
      supprimerRecette
    } = this.props;

    const logout = <button onClick={this.logout}>Déconnexion</button>;

    // if the user is not logged in
    if (!this.state.uid) {
      return <Login authenticate={this.authenticate}></Login>;
    }

    if (this.state.uid !== this.state.chef) {
      return (
        <div>
          <p>Vous n'êtes pas propriétaire de ces recettes.</p>
          {logout}
        </div>
      );
    }

    return (
      <div className="cards">
        <AjouterRecette ajouterRecette={ajouterRecette} />
        {Object.keys(recettes).map(key => (
          <AdminForm
            key={key}
            id={key}
            majRecette={majRecette}
            recettes={recettes}
            supprimerRecette={supprimerRecette}
          />
        ))}
        <footer>
          <button onClick={chargerExemple}>Remplir</button>
          {logout}
        </footer>
      </div>
    );
  }
}
