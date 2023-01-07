var IdChain = artifacts.require("./IdChain.sol");

contract('IdChain', function(accounts) {

  it("should assert true", function(done) {
    var id_chain = IdChain.deployed();
    assert.isTrue(true);
    done();
  });

  it("initializes with idCount to 0", function() {
    return IdChain.deployed().then(function(instance) {
        return instance.idCount();
        }).then(function(idCount) {
            assert.equal(idCount, 0, "idCount is not 0");
        });
    });

    //test per aggiungere una nuova IdCard

    //test per l'eliminazione di una IdCard

    //test per il recupero di una IdCard

    //test per l'autenticazione di una IdCard

});