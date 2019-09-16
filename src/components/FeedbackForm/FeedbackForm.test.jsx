import React from 'react';
import { act, cleanup, render, fireEvent, waitForElement } from '@testing-library/react';
import FeedbackForm from './FeedbackForm';

import DrupalOauth from 'gatsby-theme-osiolabs-drupal/src/components/drupal-oauth/DrupalOauth';
jest.mock('gatsby-theme-osiolabs-drupal/src/components/drupal-oauth/DrupalOauth');
const drupalOauthClient = new DrupalOauth();

afterEach(cleanup);

beforeEach(() => {
  fetch.resetMocks();
  drupalOauthClient.isLoggedIn.mockClear();
});

/**
 * Helper to fill out the feedback form.
 */
const doFillForm = async (getByText, getByLabelText, getByPlaceholderText) => {
  const yesNoField = getByLabelText('Yes');
  fireEvent.click(yesNoField);
  const feedbackField = await waitForElement(() =>
    getByPlaceholderText('Tell us more ...')
  );
  fireEvent.change(feedbackField, { target: { value: 'It does not suck.' } });
  const submitButton = getByText('Share feedback');
  fireEvent.click(submitButton);
};

describe('Component: <FeedbackForm />', () => {
  it('renders correctly', () => {
    const { asFragment } = render(
      <FeedbackForm
        drupalOauthClient={drupalOauthClient}
        tutorialId="42"
        tutorialUrl="http://example.com/tutorial"
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('displays a success message', async () => {
    fetch.mockResponse(JSON.stringify({ sid: '12345' }));

    const { container, getByText, getByLabelText, getByPlaceholderText } = render(
      <FeedbackForm
        drupalOauthClient={drupalOauthClient}
        tutorialId="42"
        tutorialUrl="http://example.com/tutorial"
      />
    );

    // Submit the form.
    await doFillForm(getByText, getByLabelText, getByPlaceholderText);

    expect(container.firstChild).toHaveClass('loading');

    const success = await waitForElement(() =>
      getByText(/Thanks for your feedback/)
    );

    expect(success).toBeTruthy();
    // Once to see if the user is logged and to try and get an oauth token.
    expect(drupalOauthClient.isLoggedIn).toHaveBeenCalledTimes(1);
    // Once to get a CSRF token, and once to submit the data to the API.
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('displays error messages returned from the server', async () => {
    fetch
      .once("CSRF_TOKEN")
      .once(JSON.stringify({ error: {message: 'Mock error from server'} }));

    const { container, getByText, getByLabelText, getByPlaceholderText } = render(
      <FeedbackForm
        drupalOauthClient={drupalOauthClient}
        tutorialId="42"
        tutorialUrl="http://example.com/tutorial"
      />
    );

    // Submit the form.
    await doFillForm(getByText, getByLabelText, getByPlaceholderText);

    expect(container.firstChild).toHaveClass('loading');

    const error = await waitForElement(() =>
      getByText(/Mock error from server/)
    );

    expect(error).toBeTruthy();
    // Once to see if the user is logged and to try and get an oauth token.
    expect(drupalOauthClient.isLoggedIn).toHaveBeenCalledTimes(1);
    // Once to get a CSRF token, and once to submit the data to the API.
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("displays an error message when API can't be reached", async () => {
    fetch
      .once('CSRF_TOKEN')
      .mockReject(new Error('mock api unreachable'));

    const { container, getByText, getByLabelText, getByPlaceholderText } = render(
      <FeedbackForm
        drupalOauthClient={drupalOauthClient}
        tutorialId="42"
        tutorialUrl="http://example.com/tutorial"
      />
    );

    // Submit the form.
    await doFillForm(getByText, getByLabelText, getByPlaceholderText);

    const error = await waitForElement(() =>
      getByText(/mock api unreachable/)
    );

    expect(error).toBeTruthy();
    expect(fetch).toHaveBeenCalledTimes(2);

    // Try it again with a BAD CSRF token.
    fetch.resetMocks();
    fetch.mockReject(new Error('no csrf token'));

    // Submit the form.
    await doFillForm(getByText, getByLabelText, getByPlaceholderText);

    const csrfError = await waitForElement(() =>
      getByText(/Invalid CSRF token/)
    );

    expect(csrfError).toBeTruthy();
    // We bail early and don't try and submit to the API if we don't have a
    // valid CSRF token.
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
