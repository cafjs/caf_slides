# Caf.js

Co-design cloud assistants with your web app and IoT devices.

See https://www.cafjs.com

## Presentation App

Learns during rehearsal how long it takes you to present a set of slides. Then, in the middle of the actual presentation, it will send you a warning SMS if you are not going to make it.

Start by creating a CA with name `admin` that manages all your presentations.

Using that instance, create a presentation `bar` by adding a binding to a URL `url` containing the slides.

It is assumed that slides are accessed with `url/#number`, e.g.,  `http://localhost:8000/programming2/slides/1`
