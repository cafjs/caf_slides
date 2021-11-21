# Caf.js

Co-design cloud assistants with your web app and IoT devices.

See https://www.cafjs.com

## Presentation App

Shares an html presentation, for example, implemented with Gatsby (Jamstack), propagating in real-time page changes from a primary web app instance to all the replica web app instances.

Watch a video, which shows this app used as a WAB (Web App Background), in [here](https://youtu.be/bHo7lmurc2A)

### Training mode

It also learns during rehearsal how long it takes you to present a set of slides. Then, in the middle of the actual presentation, it will send you a warning SMS if you are not going to make it.

### Setup

Start by creating a CA with name `admin` that manages all your presentations.

Using that instance, create a presentation `bar` by adding a binding to a URL containing the slides, for example `http://localhost:8000/bar/slides`.

And when you add the CA instance `bar` the app appears.

A few examples of gatsby presentations in https://github.com/cafjs/caf_gatsbyslides.git . Note that we use a modified version of the mdx deck theme that adds a control api to the slides (`caf_gatsby-theme-mdx-deck`).
