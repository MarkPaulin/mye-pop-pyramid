library(tidyverse)
library(readxl)
library(jsonlite)


mye_raw <- read_xlsx('../data/MYE18_AGE_BANDS.xlsx', sheet = 2)

mye_ni <- mye_raw %>% 
  filter(area_name == 'NORTHERN IRELAND') %>% 
  filter(gender != 'All persons') %>% 
  mutate(gender = if_else(gender == 'Females', 'F', 'M')) %>% 
  group_by(year, gender, age_5) %>% 
  summarise(count = sum(MYE))

# Check sum
nrow(mye_ni) == (19 * 2 * 48)

write(toJSON(mye_ni), '../data/mye_ni.json')

mye_lgd <- mye_raw %>% 
  mutate(area_prefix = str_sub(area_code, end = 3)) %>% 
  filter(year >= 2001) %>% 
  filter(area_prefix == 'N92' | area_prefix == 'N09') %>% 
  filter(gender != 'All persons') %>% 
  mutate(gender = if_else(gender == 'Females', 'F', 'M')) %>%
  mutate(area_name = str_to_lower(area_name)) %>% 
  group_by(year, area_name, gender, age_5) %>% 
  summarise(count = sum(MYE))

# Check sum
nrow(mye_lgd) == (12 * 19 * 2 * 18)

write(toJSON(mye_lgd), '../data/mye_lgd.json')
