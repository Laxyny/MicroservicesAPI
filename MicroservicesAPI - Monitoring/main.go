package main

import (
    "encoding/json"
    "fmt"
    "io"
    "log"
    "net/http"
    "os"
    "sync"
    "time"
)

type Service struct {
    Name string `json:"name"`
    URL string `json:"url"`
}

type Config struct {
    Services []Service `json:"services"`
    IntervalSeconds int `json:"intervalSeconds"`
}

type ServiceStatus struct {
    Name string `json:"name"`
    Status string `json:"status"`
    LastChecked string `json:"lastChecked"`
}

var statusMap = make(map[string]ServiceStatus)
var mu sync.RWMutex

func loadConfig() Config {
    file, err := os.Open("config.json")
    if err != nil {
        log.Fatal("Impossible de charger config.json:", err)
    }
    defer file.Close()
    decoder := json.NewDecoder(file)
    var config Config
    if err := decoder.Decode(&config); err != nil {
        log.Fatal("Config invalide:", err)
    }
    return config
}

func checkService(service Service) {
    client := http.Client{Timeout: 2 * time.Second}
    resp, err := client.Get(service.URL)

    status := "DOWN"
    if err == nil && resp.StatusCode == 200 {
        body, _ := io.ReadAll(resp.Body)
        if string(body) != "" {
            status = "UP"
        }
        resp.Body.Close()
    }

    mu.Lock()
    statusMap[service.Name] = ServiceStatus{
        Name: service.Name,
        Status: status,
        LastChecked: time.Now().Format(time.RFC3339),
    }
    mu.Unlock()
}

func monitor(config Config) {
    for {
        for _, s := range config.Services {
            go checkService(s)
        }
        time.Sleep(time.Duration(config.IntervalSeconds) * time.Second)
    }
}

func enableCors(w http.ResponseWriter) {
    w.Header().Set("Access-Control-Allow-Origin", "*")
    w.Header().Set("Access-Control-Allow-Methods", "GET")
    w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}

func statusHandler(w http.ResponseWriter, r *http.Request) {
    enableCors(w)
    w.Header().Set("Content-Type", "application/json")
    mu.RLock()
    defer mu.RUnlock()
    json.NewEncoder(w).Encode(map[string][]ServiceStatus{
        "services": func() []ServiceStatus {
            result := []ServiceStatus{}
            for _, s := range statusMap {
                result = append(result, s)
            }
            return result
        }(),
    })
}

func main() {
    config := loadConfig()
    go monitor(config)

    http.HandleFunc("/status", statusHandler)
    fmt.Println("Monitoring sur le port 8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}