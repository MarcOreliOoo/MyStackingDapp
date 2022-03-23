var MyStackingDapp = artifacts.require("./MyStackingDapp.sol");

module.exports = function(deployer) {
  deployer.deploy(MyStackingDapp);
};
