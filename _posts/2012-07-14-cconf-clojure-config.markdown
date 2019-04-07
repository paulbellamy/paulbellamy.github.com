---
title: cconf - Easy Configuration for Clojure Apps
---

## What?

cconf is a dead-easy library for loading configuration data into your Clojure app. It loads options in from the command-line, environment variables, and JSON files, in the preference order your specify.

## Why?

Because configuration shouldn't be difficult.

## How?

    (require '[cconf.core :as cconf])

    ;; The different modules are entirely independent, and each
    ;; one is optional. So if you only want to load arguments
    ;; from the CLI you only need to include argv. I've included
    ;; all of them here for completeness.
    ;;
    ;; Preference is given to
    ;; sources listed first, so if two different sources share
    ;; the same key, whichever is listed first will be used.
    (def settings (-> (cconf/argv)                  ;; Load from CLI
                      (cconf/env)                   ;; Then from env
                      (cconf/file "config.json")    ;; Then from file
                      (cconf/defaults {:port 80}))) ;; Fill in defaults

    ;; At this point settings is a map,
    ;; so we can get our config there.
    (:host settings)
    (:port settings)

You should check out the [github repo](http://www.github.com/paulbellamy/cconf). For the full documentation.
