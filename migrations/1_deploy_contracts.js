const CCrowdFundingProject = artifacts.require("CCrowdFundingProject");

module.exports = function (deployer) {
  deployer.deploy(CCrowdFundingProject);
};