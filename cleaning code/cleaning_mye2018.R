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
