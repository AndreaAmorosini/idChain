var IdChain = artifacts.require("./IdChain.sol");
var sha256 = require('js-sha256');

contract('IdChain', function(accounts) {
  var idChainInstance;

  it("should assert true", function(done) {
    var id_chain = IdChain.deployed();
    assert.isTrue(true);
    done();
  });

  it("initializes with idCount to 0", function() {
    return IdChain.deployed().then(function(instance) {
        return instance.idCardsCount();
        }).then(function(idCardsCount) {
            assert.equal(idCardsCount, 0, "idCardsCount is not 0");
        });
    });

    //test per aggiungere una nuova IdCard
    it("add a new IdCard", function() {
      return IdChain.deployed().then(function(instance) {
        idChainInstance = instance;
        return idChainInstance.createIdCard("Andrea", "Amorosini", "24/03/2000", "Avellino",
         "MRSNDR0024CAV", "Via Modestino Del Gaizo 6", "Avellino", "AV", "83100", "3311242336",
          sha256('password'), {from: accounts[1]});
      }).then(function(receipt) {
        return idChainInstance.idCardsCount();
      }).then(function(idCardsCount) {
        assert.equal(idCardsCount, 1, "idCount is not 1");
        return idChainInstance.readIdCard("MRSNDR0024CAV", sha256('password'), {from: accounts[1]});
      }).then(function(idCard) {
        console.log("IDCARD : " + idCard);
        var idCardProcess = idCard.split("//");
        assert.equal(idCardProcess[0], "Andrea", "name is not Andrea");
        assert.equal(idCardProcess[1], "Amorosini", "surname is not Amorosini");
        assert.equal(idCardProcess[2], "24/03/2000", "birthDate is not 24/03/2000");
        assert.equal(idCardProcess[3], "Avellino", "birthPlace is not Avellino");
        assert.equal(idCardProcess[4], "MRSNDR0024CAV", "fiscalCode is not MRSNDR0024CAV");
        assert.equal(idCardProcess[5], "Via Modestino Del Gaizo 6", "address is not Via Modestino Del Gaizo 6");
        assert.equal(idCardProcess[6], "Avellino", "city is not Avellino");
        assert.equal(idCardProcess[7], "AV", "state is not AV");
        assert.equal(idCardProcess[8], "83100", "zipCode is not 83100");
        assert.equal(idCardProcess[9], "3311242336", "phoneNumber is not 3311242336");
      });
    });

        //testa l'accesso come admin
        it("check on admin rights", function() {
          return IdChain.deployed().then(function(instance) {
            idChainInstance = instance;
            return idChainInstance.readIdCard("MRSNDR0024CAV", sha256("password"), {from: accounts[0]});
          }).then(function(idCard) {
            console.log("IDCARD : " + idCard);
            var idCardProcess = idCard.split("//");
            assert.equal(idCardProcess[0], "Andrea", "name is not Andrea");
            assert.equal(idCardProcess[1], "Amorosini", "surname is not Amorosini");
            assert.equal(idCardProcess[2], "24/03/2000", "birthDate is not 24/03/2000");
            assert.equal(idCardProcess[3], "Avellino", "birthPlace is not Avellino");
            assert.equal(idCardProcess[4], "MRSNDR0024CAV", "fiscalCode is not MRSNDR0024CAV");
            assert.equal(idCardProcess[5], "Via Modestino Del Gaizo 6", "address is not Via Modestino Del Gaizo 6");
            assert.equal(idCardProcess[6], "Avellino", "city is not Avellino");
            assert.equal(idCardProcess[7], "AV", "state is not AV");
            assert.equal(idCardProcess[8], "83100", "zipCode is not 83100");
            assert.equal(idCardProcess[9], "3311242336", "phoneNumber is not 3311242336");
          });
        });
    

    //test su funzionamento autenticazione password
    it("check on password", function() {
      return IdChain.deployed().then(function(instance) {
        idChainInstance = instance;
        return idChainInstance.readIdCard("MRSNDR0024CAV", sha256('pwd'), {from: accounts[1]});
      }).then(function(idCard) {
        console.log("IDCARD : " + idCard);
        assert.equal(idCard, "errorPassword", "il controllo è fallito");
      });
    });

        //test per l'autenticazione di una IdCard
        it("authenticate an IdCard", function() {
          return IdChain.deployed().then(function(instance) {
            idChainInstance = instance;
          }).then(function(receipt) {
            return idChainInstance.authorize(sha256('password'), {from: accounts[1]});
          }).then(function(receipt) {
            assert.equal(receipt, "Autorizzato", "Non autorizzato");
          });
        });
    

    //test per l'eliminazione di una IdCard
    it("delete an IdCard", function() {
      return IdChain.deployed().then(function(instance) {
        idChainInstance = instance;
        return idChainInstance.deleteIdCard(sha256('password'), {from: accounts[1]});
      }).then(function(receipt) {
        return idChainInstance.idCardsCount();
      }).then(function(idCardsCount) {
        assert.equal(idCardsCount, 0, "idCount is not 0");
        return idChainInstance.readIdCard("MRSNDR0024CAV", sha256('password'), {from: accounts[1]});
      }).then(function(idCard) {
        console.log("IDCARD : " + idCard);
        assert.equal(idCard, "cardNotFound", "Non restituisce il messaggio di errore");
      });
    });

    
    //testa il controllo sulla data di scadenza nel recupero dei dati
    it("check on dataScadenza recuperoDati", function() {
      return IdChain.deployed().then(function(instance) {
        idChainInstance = instance;
        return idChainInstance.readIdCard("MRSNDR0022", sha256('password'), {from: accounts[2]});
      }).then(function(idCard) {
        console.log("IDCARD : " + idCard);
        assert.equal(idCard, "expireCard", "il controllo è fallito");
      });
    });

    //testa il controllo sulla data di scadenza nell'autorizzazione
    it("check on dataScadenza auth", function() {
      return IdChain.deployed().then(function(instance) {
        idChainInstance = instance;
        return idChainInstance.authorize(sha256('password'), {from: accounts[2]});
      }).then(function(result) {
        assert.equal(result, "expireCard", "il controllo è fallito");
      });
    });

    //testa il rinnovo della carta
    it("check on rinnovoCarta", function() {
      return IdChain.deployed().then(function(instance) {
        idChainInstance = instance;
        return idChainInstance.renewIdCard(sha256('password'), {from: accounts[2]});
      }).then(function(resultRenew) {
        //console.log("RESULT : " + resultRenew);
        //assert.equal(resultRenew, "Carta rinnovata con successo", "il rinnovo è fallito");
        return idChainInstance.authorize(sha256('password'), {from: accounts[2]});
      }).then(function(resultAuth){
        assert.equal(resultAuth, "Autorizzato", "il controllo è fallito");
      });
    });
    







});