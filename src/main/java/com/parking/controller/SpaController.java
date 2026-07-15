package com.parking.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {

    @RequestMapping(value = {
        "/",
        "/login",
        "/dashboard",
        "/shop/{id}",
        "/tenant/editor/{id}"
    })
    public String forward() {
        // Forwarding to index.html to support React Router HTML5 History API
        return "forward:/index.html";
    }
}
