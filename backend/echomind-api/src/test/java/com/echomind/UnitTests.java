package com.echomind;

import com.echomind.ai.DemoAiProvider;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class UnitTests {
    @Test
    void demoProviderLabelsResponses() {
        var ai = new DemoAiProvider();
        assertTrue(ai.isDemo());
        assertTrue(ai.chat(List.of(), "help me plan a roadmap").startsWith("[Demo]"));
    }

    @Test
    void demoProviderAnswersFromContext() {
        var ai = new DemoAiProvider();
        String a = ai.answerFromContext("remote work?", List.of("Employees may work remotely three days per week."));
        assertTrue(a.contains("three days"));
    }
}
