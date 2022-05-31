import React, { Component } from "react";
import MyToken from "./contracts/MyToken.json";
import MyTokenSale from "./contracts/MyTokenSale.json";
import kycContract from "./contracts/KycContract.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = {loaded:false,newAddr:'',tokenSaleAddress:null,no_of_tokens:0};

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      this.web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts();

      // Get the contract instance.
      this.networkId = await this.web3.eth.net.getId();

      this.tokenInstance = new this.web3.eth.Contract(
        MyToken.abi,
        MyToken.networks[this.networkId] && MyToken.networks[this.networkId].address,
      );

      this.tokenSalesInstance = new this.web3.eth.Contract(
        MyTokenSale.abi,
        MyTokenSale.networks[this.networkId] && MyTokenSale.networks[this.networkId].address,
      );

      this.KycInstance = new this.web3.eth.Contract(
        kycContract.abi,
        kycContract.networks[this.networkId] && kycContract.networks[this.networkId].address,
      );

      this.listenToTokenTransfer();
      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({loaded:true,tokenSaleAddress:MyTokenSale.networks[this.networkId].address},this.updateToken);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

   submitAddress = async()=>{
       console.log("Submitted",this.state.newAddr);
       await this.KycInstance.methods.setKycCompleted(this.state.newAddr).send({from:this.accounts[0]});
       alert('KYC FOR ADDRESS '+this.state.newAddr+' is done....');
       this.setState({...this.state,newAddr:''})
  }

  updateToken = async()=>{
    let tokensAvailable = await this.tokenInstance.methods.balanceOf(this.accounts[0]).call();
    this.setState({no_of_tokens:tokensAvailable})
  }

  listenToTokenTransfer = ()=>{
      this.tokenInstance.events.Transfer({to:this.accounts[0]}).on("data",this.updateToken);
  }
  handleBuyToken = async()=>{
      await this.tokenSalesInstance.methods.buyTokens(this.accounts[0]).send({from:this.accounts[0],value:this.web3.utils.toWei("1000000","wei")});

  }
 
  render() {
    if (!this.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Mandala Token Sale</h1>
        <p>Get Your Token Today!</p>
        <h2>Kyc WhiteListing</h2>

      
          Adress to allow: <input type="text" value={this.state.newAddr} placeholder="Enter address to add" onChange={(e)=>this.setState({...this.state,newAddr:e.target.value})}></input>
          <button type="button" onClick={this.submitAddress}>
            Add Address
          </button>
          <h2>
            Buy Tokens?
          </h2>
          <p>
            If you want to buy tokens.. send wei to this address <b>{this.state.tokenSaleAddress}</b>
          </p>
          <p>
            You have {this.state.no_of_tokens} MANDALA tokens.
          </p>
          <button type="button" onClick={this.handleBuyToken}>
              Buy more token
          </button>
        
      </div>
    );
  }
}

export default App;
