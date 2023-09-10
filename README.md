# BarkTracker

## Description

This repository contains the code and resources for my Bachelor Thesis project, a low-cost dog monitoring system that detects barks using artificial intelligence. Developed to improve upon existing sound threshold-based systems, it aims to reduce false positive notifications and offer users real-time monitoring capabilities. The system is composed of two main components: the monitoring hardware setup built around a Raspberry Pi and a mobile application for real-time control and monitoring.

## Table of Contents

- [Description](#description)
- [Prerequisites](#prerequisites)
- [Installation Guide](#installation-guide)
  - [Monitoring System Installation](#monitoring-system-installation)
  - [Mobile Application Installation](#mobile-application-installation)
- [Usage](#usage)
- [License](#license)
- [Acknowledgements](#acknowledgements)

## Prerequisites

**Hardware:**
- Raspberry Pi (Model 3 B+ or higher)
- [USB Microphone](https://www.amazon.es/gp/product/B01KLRBHGM/ref=ppx_yo_dt_b_asin_title_o00_s00?ie=UTF8&psc=1)
- [Raspberry Pi's official camera](https://www.amazon.es/LABISTS-Oficial-Raspberry-Soporte-Nocturna/dp/B07TXGGJMT?pd_rd_w=zpxxJ&pf_rd_p=16e9daed-4ab0-42c9-90f3-9086ed4a10c1&pf_rd_r=ZB7S4EEANXCSVDACEVAQ&pd_rd_r=6d2cbe47-9097-4be6-a32a-e46a997b26ec&pd_rd_wg=QTXPF&pd_rd_i=B07TXGGJMT&ref_=pd_bap_d_rp_1_13_t)
- [Speaker with charging capabilities](https://www.amazon.co.uk/Generation-Capsule-Speaker-Compatible-Smartphones-Black/dp/B001UEBN42)

**Software:**
- Raspbian Stretch OS
- Python 3.6 and related libraries (TensorFlow, LibROSA, Numpy, Sounddevice, Joblib, Sauth)
- User space Video4Linux (UV4L) drivers
- Android Device (for the mobile application)

## Installation Guide

### Monitoring System Installation

1. **Hardware Setup:** Gather all the hardware components mentioned in prerequisites.
  
2. **Raspberry Pi Setup:** 
    - Install Raspbian Stretch OS on your Raspberry Pi.
    - Set up Python 3.6 and required Python libraries using: `pip3.6 install librosa numpy tensorflow sounddevice joblib sauth`.
  
3. **Install UV4L Drivers:** Follow the steps detailed in the original installation guide provided above.
  
4. **Setup AI Model:** 
    - Clone this repository.
    - Copy the `bark-detection` folder to the Raspberry Pi's desktop.
    - Navigate to the `bark-detection` folder and run `python3.6 run_model.py` in the terminal. Leave this terminal open.
  
5. **Setup Server:** 
    - Navigate to the `server` folder inside `bark-detection`.
    - Run `sauth --https *USER* *PASSWORD*`. Remember to replace `*USER*` and `*PASSWORD*` with your credentials. Leave this terminal open as well.
  
6. **Port Forwarding:** To access the Raspberry Pi over the internet, refer to the [port forwarding guide](https://portforward.com/router.htm).

### Mobile Application Installation

1. **Download the App:** Download `BarkTracker.apk` from the `user-installation` folder in this repository to your Android device.
  
2. **Installation:**
    - Open the file via the device's file explorer.
    - Enable `Allow installs from unknown sources` when prompted. Remember to disable this option post-installation.
    - Follow the prompts to complete the installation.

3. **App Configuration:** Once installed, open the app and enter the necessary settings that were defined during the monitoring system setup.

## Usage

With both the monitoring system and mobile application installed and set up:

- Use the mobile application to view real-time video and audio.
- Access system settings and check the bark record as needed.
- Adjust system parameters to suit your environment and preferences.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.

## Acknowledgements

I owe immense gratitude to my family for their unwavering support, my friends and coworkers at Dominion for their invaluable insights, and especially to my tutor, Ángel, for his guidance and the foundational idea behind this project.
