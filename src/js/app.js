App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    return await App.initWeb3();
  },

  initWeb3: async function() {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);
    web3.eth.defaultAccount = web3.eth.accounts[0];
    return App.initContract();
  },

  initContract: function() {
    // Json generato alla compilazione dello smart contract
    $.getJSON('IdChain.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var idChainArtifact = data;
      App.contracts.IdChain = TruffleContract(idChainArtifact);

      // Set the provider for our contract
      App.contracts.IdChain.setProvider(App.web3Provider);

      var idCardInstance;

      App.contracts.IdChain.deployed().then(function(instance) {
        idCardInstance = instance;
      })
    }).then(function() { return App.createLandingPage(); });


  },

  //bindEvents: function() {
  //  $(document).on('click', '.btn-adopt', App.handleAdopt);
  //},
  getInstance: function() {
    var idCardInstance = App.contracts.IdChain.deployed().then(function(instance) {
      return instance;
    })
    return idCardInstance;
  },

  createIdCard: function() {

    //idCardInstance.createIdCard(form.elements["name"].value, form.elements["surname"].value, form.elements["birthDate"].value, form.elements["birthPlace"].value, form.elements["cf"].value, form.elements["homeAddress"].value, form.elements["city"].value, form.elements["province"].value, form.elements["cap"].value, form.elements["phone"].value, form.elements["password"].value);
    // Non metto gli id perché gli elementi hanno giá id a caso
    //idCardInstance.createIdCard(form.elements[0].value, form.elements[1].value, form.elements[9].value, form.elements[8].value, form.elements[2].value, form.elements[4].value, form.elements[5].value, form.elements[6].value, form.elements[7].value, form.elements[3].value, form.elements[10].value);

    App.contracts.IdChain.deployed().then(function(instance) {
      var form = document.registrationForm;
      return instance.createIdCard(form.elements[0].value, form.elements[1].value, form.elements[9].value, form.elements[8].value, form.elements[2].value, form.elements[4].value, form.elements[5].value, form.elements[6].value, form.elements[7].value, form.elements[3].value, form.elements[10].value);
    }).then(function() {
      return App.createLoginPage();
    })

  },

  userReadIdCard: function() {

    App.contracts.IdChain.deployed().then(function(instance) {
      var form = document.loginForm;
      var idChainInstance = instance;
      return idChainInstance.readIdCard.call('', form.elements[0].value);
    }).then(function(results) {
      details = results.split('//');
      if (details.length == 1) {
        return App.createErrorPage(details[0]);
      }
      return App.createDetailsPage();
    })
  },

  searchIdCard: function() {
    App.contracts.IdChain.deployed().then(function(instance) {
      var form = document.searchForm;
      var idChainInstance = instance;
      return idChainInstance.readIdCard.call(form.elements[0].value, form.elements[1].value);
    }).then(function(results) {
      details = results.split('//');
      if (details.length == 1) {
        return App.createErrorPage(details[0]);
      }
      else {
        return App.createDetailsPage();
      }
    });
  },

  deleteIdCard: function() {
    App.contracts.IdChain.deployed().then(function(instance) {
      var form = document.deleteForm;
      var idChainInstance = instance;
      var message = idChainInstance.deleteIdCard(form[0].value);
      App.createErrorPage(message);
    });
  
  },

  renewIdCard: function() {
    App.contracts.IdChain.deployed().then(function(instance) {
      var form = document.renewForm;
      var idChainInstance = instance;
      return idChainInstance.renewIdCard(form["password"].value);
    }).then(function(message) {
      App.createErrorPage(message);
    })
  },

  messageHandler: function(message) {
    var finalMessage;
    switch(message) {
      // Errori
      case "errorPassword":
        finalMessage = "La password inserita non e' corretta.";
        break;
      case 'cardNotFound':
        finalMessage = "La carta richiesta non e' stata trovata.";
        break;
      case 'expireCard':
        finalMessage = "La carta e' scaduta, si prega di rinnovare la carta.";
        break;

      // Successo
      case 'cardDeleteSuccess':
        finalMessage = "La carta e' stata rimossa con successo.";
        break;
      case 'Autorizzato':
        finalMessage = "Autorizzazione avvenuta con successo.";
        break;
      case 'cardRenewSuccess':
        finalMessage = "La carta e' stata rinnovata con successo.";
        break;
      default:
        return "Nessun messaggio";
    }

    return finalMessage;
  },

  authorizeRequest: function() {
    App.contracts.IdChain.deployed().then(function(instance) {
      var form = document.authForm;
      var idChainInstance = instance;
      return idChainInstance.authorize.call(form["password"].value);
    }).then(function(response) {
      App.createErrorPage(response);
    });
  },

  createLandingPage: function () {
    // Pagina iniziale, come e' fatta ora.
    // Ha due pulsanti: uno per il login e uno per la registrazione.
    // Avviene tramite caricamento di un file html.

    App.contracts.IdChain.deployed().then(function(instance) {
      var form = document.loginForm;
      var idChainInstance = instance;
      return idChainInstance.isAdmin.call();
    }).then(function(boolIsAdmin) {
      $(document).on('click', '.btn-redirToLanding', App.createLandingPage)
      if(boolIsAdmin == true) {
        $("#page").load("./html/AdminPage.html", function() {
          $(document).on('click', '.btn-submitSearch', App.searchIdCard);
        });
      }
      else {
        $("#page").load("./html/LandingPage.html", function() {
          $(document).on('click', '.btn-redirToLogin', App.createLoginPage);
          $(document).on('click', '.btn-redirToRegistration', App.createRegistrationPage);
        });
      }
    });
  },

  createLoginPage: function() {
    // Un pulsante per il submit con classe .btn-readIdCard
    // e un altro pulsante con classe .btn-redirToRegistration per il redirect alla pagina di registrazione.

    $("#page").load("./html/LoginPage.html", function() {
      $('.btn-readIdCard').click(App.userReadIdCard);
    });

    // Effettua il binding della funzione userReadIdCard al pulsante per il login


    // Effettua il binding della funzione createRegistrationPage al pulsante per il redirect alla pagina di registrazione
    //$(document).on('click', '.btn-redirToRegistration', App.createRegistrationPage);
  },

  createRegistrationPage: function() {
    // Creazione della pagina di registrazione.
    // Avviene tramite caricamento di un file html, che rimpiazza i contenuti di #page
    // E' presente un form con un pulsante con classe .btn-register

    $("#page").load("./html/RegisterPage.html", function() {
      $('.btn-register').click(App.createIdCard);
    });
  },

  createDetailsPage: function() {
    // Creazione della pagina di visualizzazione dei dati.
    // Si effettua l'accesso a questa pagina tramite registrazione o login.
    $("#page").load("./html/DetailsPage.html", function() {
      $("#name-a4d5").val(details[0]);
      $('#surname-a4d5').val(details[1]);
      $('#date-3062').val(details[2]);
      $('#text-ec06').val(details[3]);
      $('#fiscCode').val(details[4]);
      $('#address-662c').val(details[5]);
      $('#text-1575').val(details[6]);
      $('#text-6504').val(details[7]);
      $('#text-1ea9').val(details[8]);
      $('#phone-894b').val(details[9]);
      
      $('.btn-deleteIdCard').click(App.createDeletePage);
      $('.btn-authorizeIdCard').click(App.createAuthorizePage);
    });
    // Aggiunta dei dati tramite jquery e id di elementi html

    // Aggiunta dei binding sul pulsante di eliminazione e di rinnovo della carta
    // Classi: .btn-deleteIdCard, .btn-renewIdCard
    // Fanno parte di un form dove e' presente un box per la password
  },

  createDeletePage: function() {
    $("#page").load("./html/DeletePage.html", function() {
      $('.btn-submitDelete').click(App.deleteIdCard);
    });
  },

  createErrorPage: function(error) {
    // Creazione della pagina di errore. Viene chiamata se la carta non esiste, la password e' errata,
    // La carta e' scaduta etc...
    // Viene data in input una stringa contenente l'errore, che sostituira'
    // l'elemento con l'id #error nel file html.
    //
    // Sarebbe possibile sennó aggiungere uno spazio dedicato agli errori sulle pagine
    // sulle quali si trova l'utente prima di avere l'errore.
    // In particolare, secondo me gli errori dovrebbero essere mostrati solo sulla
    // pagina di login
    // Viene dunque mostrato il messaggio di errore tramite js.

    //$("#page").load("../errorPage.html");

    if(error == "expireCard") {
      return createRenewPage();
    }
    var fullError = App.messageHandler(error);
    App.addInlineMessage(fullError);

    // Per tornare alla landing page dopo aver mostrato un errore per 5 secondi:
    //
    // $("#error").append("\nTornerete alla pagina iniziale entro 5 secondi.")
    // setTimeout(App.createLandingPage, 5000);

//    $(document).on('click', 'btn-renewIdCard', App.renewIdCard);
  },

  createRenewPage: function() {
    $("#page").load("./html/ErrorScadenzaPage.html", function() {
      $(".btn-submitRenew").click(App.renewIdCard);
    });
  },

  createAuthorizePage: function() {
    $("#page").load("./html/AuthorizeTest.html", function() {
      $(".btn-submitAuthorize").click(App.authorizeRequest);
    })
  },

  addInlineMessage: function(message) {
    $("#message").text(message);
  }
};

//$(function() {
//  $(window).load(function() {
//    App.init();
//  });
//});
var details = "cardNotFound";

$(function() {
  $(document).ready(function() {
    App.init();
  });
});
