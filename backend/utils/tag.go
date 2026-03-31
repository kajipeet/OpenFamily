package utils

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
)

var adjectives = []string{
	"wild", "golden", "silver", "scarlet", "azure",
	"crimson", "emerald", "violet", "amber", "crystal",
	"mystic", "royal", "sacred", "velvet", "radiant",
}

var flowers = []string{
	"rose", "dahlia", "tulip", "orchid", "lily",
	"jasmine", "iris", "lotus", "peony", "lavender",
	"sage", "poppy", "clover", "daisy", "cedar",
}

// GenerateTag returns a unique tag like @wild_rose_a7f2
func GenerateTag() string {
	aIdx := randByte() % len(adjectives)
	fIdx := randByte() % len(flowers)
	suffix := make([]byte, 2)
	rand.Read(suffix) //nolint:errcheck
	return fmt.Sprintf("@%s_%s_%s", adjectives[aIdx], flowers[fIdx], hex.EncodeToString(suffix))
}

func randByte() int {
	b := make([]byte, 1)
	rand.Read(b) //nolint:errcheck
	return int(b[0])
}
