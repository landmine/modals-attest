const { Builder, By, Key, until, WebElement } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('chai').assert;

const AttestBuilder = require('attest-webdriverjs');
const attest = require('attest-node');

const options = new chrome.Options();

options.addArguments(
  'headless',
  'disable-gpu',
  'log-level=3'
);

const attestBuilder = async (driver, standard = undefined) => {
  const attest = await new AttestBuilder(driver, standard);
  const results = await attest.analyze();
  return results;
}

const auditResults = () => true;

describe('Pearson UX Modal Accessibility Testing', () => {
  let driver, reporter;

  before(async () => {
    reporter = attest.report('attest', './a11y-results');

    driver = await new Builder()    
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();

    driver.manage().timeouts().setScriptTimeout(60000);
  });

  after(async () => {
    reporter.buildHTML('./a11y-reports/');
    await driver.quit(); 
  });

  describe('initial state', () => {
    it('should have 0 accessibility violations', async () => {
      await driver.get('http://localhost:8081/example');
      const results = await attestBuilder(driver);
      assert(results.violations.length === 0, 'Accessibility violations detected: ' + JSON.stringify(results.violations, null, 2));
      reporter.logTestResult('initial state', results);
    });
  });

  describe('modal', () => {
    it('should have 0 accessibility violations', async () => {
      await driver.get('http://localhost:8081/example');
      await driver.findElement(By.id('trigger-modal')).click();
      await driver.sleep(3000);
      const results = await attestBuilder(driver);
      assert(results.violations.length === 0, 'Accessibility violations detected: ' + JSON.stringify(results.violations, null, 2));    
      reporter.logTestResult('modal', results);
    });

    it('should return focus to the button on close', async () => {
      await driver.get('http://localhost:8081/example');
      await driver.findElement(By.id('trigger-modal')).click();
      
      let shadowHost;
      let shadowRoot;

      await (shadowHost = driver.findElement(By.css('pearson-modal[triggerid="trigger-modal"]')));
      await (shadowRoot = driver.executeScript('return arguments[0].shadowRoot', shadowHost));

      await shadowRoot.then(async (result) => {
        await driver.sleep(3000);
        await result.findElement(By.css('#closeButton')).click();
      });

      await driver.sleep(3000);
      const targetEl = await (driver.findElement(By.id('trigger-modal')));
      const actualEl = await (driver.switchTo().activeElement());
      assert(await WebElement.equals(targetEl, actualEl));      
    });
  });

  describe('no cancel modal', () => {
    it('should have 0 accessibility violations', async () => {
      await driver.get('http://localhost:8081/example');
      await driver.findElement(By.id('trigger-modal-two')).click();
      await driver.sleep(3000);
      const results = await attestBuilder(driver);
      assert(results.violations.length === 0, 'Accessibility violations detected: ' + JSON.stringify(results.violations, null, 2));    
      reporter.logTestResult('no cancel modal', results);
    });

    it('should return focus to the button on close', async () => {
      await driver.get('http://localhost:8081/example');
      await driver.findElement(By.id('trigger-modal-two')).click();
      
      let shadowHost;
      let shadowRoot;

      await (shadowHost = driver.findElement(By.css('pearson-modal[triggerid="trigger-modal-two"]')));
      await (shadowRoot = driver.executeScript('return arguments[0].shadowRoot', shadowHost));

      await shadowRoot.then(async (result) => {
        await driver.sleep(3000);
        await result.findElement(By.css('#closeButton')).click();
      });

      await driver.sleep(3000);
      const targetEl = await (driver.findElement(By.id('trigger-modal-two')));
      const actualEl = await (driver.switchTo().activeElement());
      assert(await WebElement.equals(targetEl, actualEl));      
    });
  });

  describe('no success modal', () => {
    it('should have 0 accessibility violations', async () => {
      await driver.get('http://localhost:8081/example');
      await driver.findElement(By.id('trigger-modal-three')).click();
      await driver.sleep(3000);
      const results = await attestBuilder(driver);
      assert(results.violations.length === 0, 'Accessibility violations detected: ' + JSON.stringify(results.violations, null, 2));    
      reporter.logTestResult('no success modal', results);
    });

    it('should return focus to the button on close', async () => {
      await driver.get('http://localhost:8081/example');
      await driver.findElement(By.id('trigger-modal-three')).click();
      
      let shadowHost;
      let shadowRoot;

      await (shadowHost = driver.findElement(By.css('pearson-modal[triggerid="trigger-modal-three"]')));
      await (shadowRoot = driver.executeScript('return arguments[0].shadowRoot', shadowHost));

      await shadowRoot.then(async (result) => {
        await driver.sleep(3000);
        await result.findElement(By.css('#closeButton')).click();
      });

      driver.sleep(3000);
      const targetEl = await (driver.findElement(By.id('trigger-modal-three')));
      const actualEl = await (driver.switchTo().activeElement());
      assert(await WebElement.equals(targetEl, actualEl));      
    });
  });

  describe('elements modal', () => {
    it('should have 0 accessibility violations', async () => {
      await driver.get('http://localhost:8081/example');
      await driver.findElement(By.id('trigger-modal-four')).click();
      await driver.sleep(3000);
      const results = await attestBuilder(driver);
      assert(results.violations.length === 0, 'Accessibility violations detected: ' + JSON.stringify(results.violations, null, 2));    
      reporter.logTestResult('elements modal', results);
    });

    it('should return focus to the button on close', async () => {
      await driver.get('http://localhost:8081/example');
      await driver.findElement(By.id('trigger-modal-four')).click();
      
      let shadowHost;
      let shadowRoot;

      await (shadowHost = driver.findElement(By.css('pearson-modal[triggerid="trigger-modal-four"]')));
      await (shadowRoot = driver.executeScript('return arguments[0].shadowRoot', shadowHost));

      await shadowRoot.then(async (result) => {
        await driver.sleep(3000);
        await result.findElement(By.css('#closeButton')).click();
      });

      await driver.sleep(3000);
      const targetEl = await (driver.findElement(By.id('trigger-modal-four')));
      const actualEl = await (driver.switchTo().activeElement());
      assert(await WebElement.equals(targetEl, actualEl));      
    });
  });
});