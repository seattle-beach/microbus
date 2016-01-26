Setup Instructions 

1. Build the app
  1. Run `bundle install`.
  2. Run `rake`. Or, to run against the acceptance environment, run `rake build['acceptance'] unitTests`.
  3. You should not see any errors.

2. Launch the app
  1. Open file://<repo root>/target/index.html in a browser.
  2. You should see a login form.

3. Clone, set up, and launch weatherbus
  1. See <https://github.com/gbcm/weatherbus> and follow the directions there.
  2. Currently, need to disable CORS for local development by adding the following code to the UserController class:

    @ModelAttribute
    public void setVaryResponseHeader(HttpServletResponse response) {
      response.setHeader("Access-Control-Allow-Origin", "*");
    }

4. Create a Weatherbus user and some stops
  1. Change to the weatherbus repo from step 3 above.
  2. Create a user by running `tools/adduser bob`.
  3. Add a stop by running `tools/addstop bob <a real stop ID, e.g. 1_75403>`.
  4. Verify the setup by running `tools/getstops bob`.

5. Log in to the web front end as the newly created user
  1. If it's not still open, open file://<repo root>/target/index.html
  2. Log in as bob.
  3. You should see the stop that was created in the previous step.


Other things you can do:

* Run the Jasmine test in a browser
  1. Run `rake jasmine` and go to the URL mentioned in the output.
  2. Everything should be green.

* Run the integation tests
  1. Install PhantomJS if it's not already installed: `npm install -g phantomjs`
  2. Make sure weatherbus is running
  3. Change to the integration-tests directory and run `rspec`.
  4. Or, to test against acceptance, run `buildenv=acceptance rspec`.

* Push to the acceptance environment
  1. ./build acceptance
  2. cf login, and select the seattle-beach org and the development space.
  3. cf push
