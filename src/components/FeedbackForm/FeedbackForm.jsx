import React, {useState} from 'react';
import { Form, Message, Radio, TextArea } from 'semantic-ui-react';

const FeedbackForm = ({drupalOauthClient, tutorialId, tutorialUrl}) => {
  const [yesNo, setYesNo] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [formState, setFormState] = useState({state: false, message: ''});

  // Get a CSRF token from Drupal.
  const getCSRFToken = async () => {
    const csrfTokenUrl = `${process.env.GATSBY_DRUPAL_API_ROOT}/session/token`;

    let csrfToken;
    try {
      const response = await fetch(csrfTokenUrl);
      if (response.ok) {
        csrfToken = await response.text();
      }
    } catch (e) {
      csrfToken = false;
    }

    return csrfToken;
  };

  // See if we can get an OAuth token. If so, we can authenticate the request.
  const getOauthToken = async () => {
    let oauthToken;

    try {
      oauthToken = await drupalOauthClient.isLoggedIn();
    } catch (e) {
      oauthToken = false;
    }

    return oauthToken;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormState({state: 'loading'});

    const feedbackPostUrl = `${process.env.GATSBY_DRUPAL_API_ROOT}/webform_rest/submit?_format=json`;
    const csrfToken = await getCSRFToken();

    // This isn't going to work without a CSRF token to bail early if we don't
    // have one.
    if (!csrfToken) {
      setFormState({state: 'error', message: 'Invalid CSRF token.'});
      return;
    }

    const oauthToken = await getOauthToken();

    const headers = new Headers({
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
      'X-Consumer-ID': `${process.env.GATSBY_DRUPAL_API_ID}`,
    });

    if (oauthToken) {
      headers.set('Authorization', `${oauthToken.token_type} ${oauthToken.access_token}`);
    }

    const payload = {
      webform_id: 'tutorial_feedback',
      was_this_helpful: yesNo,
      feedback: feedback,
      tutorial_url: `${process.env.GATSBY_ROOT_URL}${tutorialUrl}`,
      tutorial_id: tutorialId
    };

    const options = {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    };

    try {
      const response = await fetch(feedbackPostUrl, options);
      if (response.ok) {
        // Success.
        const data = await response.json();

        if (typeof data.error !== 'undefined') {
          // Error processing the request.
          setFormState({state: 'error', message: data.error.message});
        } else {
          // Clear the form, and display success message.
          setYesNo(false);
          setFeedback('');
          setFormState({state: 'success'});
        }
      } else {
        // Error connecting to Drupal.
        setFormState({state: 'error', message: `${response.status}: ${response.statusText}`});
      }
    } catch (e) {
      setFormState({state: 'error', message: e.message});
    }
  };

  return (
    <Form
      onSubmit={handleSubmit}
      error={formState.state === 'error'}
      success={formState.state === 'success'}
      loading={formState.state === 'loading'}
      className="feedbackform"
    >
      {formState.state === 'success' &&
        <Message success content="Thanks for your feedback!"/>
      }
      {formState.state === 'error' &&
      <Message error header="Oh no, something went wrong"
               content={formState.message}/>
      }
      <Form.Group className="feedbackform--yesno">
        <div className="feedbackform--yesno-label">Was this helpful?</div>
        <Form.Field>
          <Radio
            label='Yes'
            name='yesNo'
            id='yesNo-yes'
            value='Yes'
            checked={yesNo === 'Yes'}
            onChange={event => setYesNo('Yes')}
          />
        </Form.Field>
        <Form.Field>
          <Radio
            label='No'
            name='yesNo'
            id='yesNo-no'
            value='No'
            checked={yesNo === 'No'}
            onChange={event => setYesNo('No')}
          />
        </Form.Field>
      </Form.Group>
      {yesNo &&
        <Form.Group className="feedbackform--hidden">
          <label htmlFor="feedback">Additional feedback:</label>
          <TextArea
            name="feedback"
            value={feedback}
            onChange={event => setFeedback(event.target.value)}
            placeholder='Tell us more ...'
          />
          <Form.Button content='Share feedback' secondary />
        </Form.Group>
      }
    </Form>
  );
};

export default FeedbackForm;
