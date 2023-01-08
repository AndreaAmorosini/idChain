var IdChain = artifacts.require("./IdChain.sol");

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
          "andale64@gmail.com", "24/03/2027" , {from: accounts[0]});
      }).then(function(receipt) {
        return idChainInstance.idCardsCount();
      }).then(function(idCardsCount) {
        assert.equal(idCardsCount, 1, "idCount is not 1");
        return idChainInstance.readIdCard(accounts[0]);
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
        assert.equal(idCardProcess[10], "andale64@gmail.com", "email is not andale64@gmail.com");
        assert.equal(idCardProcess[11], "24/03/2027", "expirationDate is not 24/03/2027");
      });
    });

        //test per l'autenticazione di una IdCard
        it("authenticate an IdCard", function() {
          return IdChain.deployed().then(function(instance) {
            idChainInstance = instance;
            /*
            return idChainInstance.createIdCard("Andrea", "Amorosini", "24/03/2000", "Avellino",
             "MRSNDR0024CAV", "Via Modestino Del Gaizo 6", "Avellino", "AV", "83100", "3311242336",
              "andale64@gmail.com", "24/03/2027" , {from: accounts[0]});
              */
          }).then(function(receipt) {
            return idChainInstance.authorize(accounts[0], {from: accounts[0]});
          }).then(function(receipt) {
            assert.equal(receipt, true, "Non autorizzato");
          });
        });
    

    //test per l'eliminazione di una IdCard
    it("delete an IdCard", function() {
      return IdChain.deployed().then(function(instance) {
        idChainInstance = instance;
        return idChainInstance.deleteIdCard(accounts[0]);
      }).then(function(receipt) {
        return idChainInstance.idCardsCount();
      }).then(function(idCardsCount) {
        assert.equal(idCardsCount, 0, "idCount is not 0");
        return idChainInstance.readIdCard(accounts[0]);
      }).then(function(idCard) {
        console.log("IDCARD : " + idCard);
        var idCardProcess = idCard.split("//");
        assert.equal(idCardProcess[0], "", "name is not empty");
        assert.equal(idCardProcess[1], "", "surname is not empty");
        assert.equal(idCardProcess[2], "", "birthDate is not empty");
        assert.equal(idCardProcess[3], "", "birthPlace is not empty");
        assert.equal(idCardProcess[4], "", "fiscalCode is not empty");
        assert.equal(idCardProcess[5], "", "address is not empty");
        assert.equal(idCardProcess[6], "", "city is not empty");
        assert.equal(idCardProcess[7], "", "state is not empty");
        assert.equal(idCardProcess[8], "", "zipCode is not 0");
        assert.equal(idCardProcess[9], "", "phoneNumber is not 0");
        assert.equal(idCardProcess[10], "", "email is not empty");
        assert.equal(idCardProcess[11], "", "expirationDate is not empty");
      });
    });

    //testa il controllo sulla data di scadenza nel recupero dei dati
    it("check on dataScadenza recuperoDati", function() {
      return IdChain.deployed().then(function(instance) {
        idChainInstance = instance;
        return idChainInstance.createIdCard("Andrea", "Amorosini", "24/03/2000", "Avellino",
         "MRSNDR0024ABC", "Via Modestino Del Gaizo 6", "Avellino", "AV", "83100", "3311242336",
          "andale64@gmail.com", "24/03/2019" , {from: accounts[1]});
      }).then(function(receipt) {
        return idChainInstance.idCardsCount();
      }).then(function(idCardsCount) {
        assert.equal(idCardsCount, 1, "idCount is not 1");
        return idChainInstance.readIdCard(accounts[1]);
      }).then(function(idCard) {
        console.log("IDCARD : " + idCard);
        assert.equal(idCard, "Carta Scaduta", "il controllo è fallito");
      });
    });


    //testa il constrollo sulla data di scadenza nell'autorizzazione
        //test per l'autenticazione di una IdCard
        it("checkDataScadenza Authenticate", function() {
          return IdChain.deployed().then(function(instance) {
            idChainInstance = instance;
            /*
            return idChainInstance.createIdCard("Andrea", "Amorosini", "24/03/2000", "Avellino",
             "MRSNDR0024CAV", "Via Modestino Del Gaizo 6", "Avellino", "AV", "83100", "3311242336",
              "andale64@gmail.com", "24/03/2027" , {from: accounts[0]});
              */
          }).then(function(receipt) {
            return idChainInstance.authorize(accounts[1], {from: accounts[1]});
          }).then(function(receipt) {
            assert.equal(receipt, false, "controllo fallito");
          });
        });



});