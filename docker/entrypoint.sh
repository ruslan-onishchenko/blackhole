#!/bin/sh
set -eu

: "${DOMAIN:?environment variable DOMAIN must be set}"

tpl=/etc/angie/angie.conf.template
conf=/etc/angie/angie.conf

sed "s|\${DOMAIN}|$DOMAIN|g" "$tpl" > "$conf"

exec "$@"
